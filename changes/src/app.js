// app.js — session flow, question/answer UI, progress, and the glue between Spotify and the synth band.
import { CONFIG } from './config.js';
import { SONGS, LEVELS } from './corpus.js';
import { parseKey, chordInfo, PALETTES, sameChord, rnDisplay, keyDisplay, pcName } from './theory.js';
import { Band } from './audio.js';
import { Spotify } from './spotify.js';
import { explain } from './progressions.js';

// ---------------------------------------------------------------- state ----
const LS_KEY = 'ct.state.v1';
const defaults = () => ({
  level: 1,
  history: [],          // {id, level, ok, chordsOk, bassOk, date, hint}
  misses: [],           // song ids to bring back
  recent: [],           // last played ids
  sessions: [],         // {date, asked, correct, seconds}
  offsets: {},          // song id -> seconds nudge for section start
  settings: { notation: 'roman', drums: true, minutes: CONFIG.sessionMinutes, weeklyGoal: 3, showKey: true },
});
function load() {
  try { const s = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); return s ? { ...defaults(), ...s, settings: { ...defaults().settings, ...(s.settings || {}) } } : defaults(); }
  catch { return defaults(); }
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* private mode */ } }
let state = load();

const band = new Band();
const spotify = new Spotify({ clientId: CONFIG.spotifyClientId, redirectUri: CONFIG.redirectUri });
const app = document.getElementById('app');

// session
let session = null; // {startedAt, asked, correct, seen:[], lastSong, endedAt}
let q = null;       // current question
let playback = { source: 'none', playing: false, progress: 0 }; // 'spotify' | 'synth'
let progressTimer = null;

// ---------------------------------------------------------------- utils ----
const h = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const today = () => new Date().toISOString().slice(0, 10);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const songById = (id) => SONGS.find(s => s.id === id);
const hasInversions = (song) => song.chords.some(c => c.bass && c.bass !== 'root');
const totalBeats = (song) => song.chords.reduce((n, c) => n + (c.beats || 4), 0);
const barsLabel = (beats) => beats % 4 === 0 ? `${beats / 4} bar${beats > 4 ? 's' : ''}` : beats % 3 === 0 ? `${beats / 3} bar${beats > 3 ? 's' : ''} (3/4)` : beats === 2 ? '½ bar' : `${beats} beats`;

function toast(msg, ms = 2600) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
}

// week dots: Monday..Sunday of the current week
function weekDots() {
  const now = new Date(); const day = (now.getDay() + 6) % 7; // Mon=0
  const monday = new Date(now); monday.setDate(now.getDate() - day);
  const days = [];
  for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); days.push(d.toISOString().slice(0, 10)); }
  const done = new Set(state.sessions.map(s => s.date));
  return days.map((d, i) => ({ d, label: 'MTWTFSS'[i], done: done.has(d), today: d === today() }));
}
function weekCount() { return weekDots().filter(x => x.done).length; }

// ---------------------------------------------------------------- picking ----
function levelPool(level) { return SONGS.filter(s => s.level === level); }
const clampLevel = (n) => Math.max(1, Math.min(LEVELS.length, n));

// The session ramps: warm up one level down, work at your level, then stretch one level up.
// Question 1-2 -> level-1, 3-4 -> level, 5+ -> level+1 (or level if there is nothing above).
function targetLevelFor(questionIndex) {
  const L = state.level;
  if (questionIndex < 2) return clampLevel(L - 1);
  if (questionIndex < 4) return L;
  return clampLevel(L + 1);
}

function pickSong() {
  const seen = new Set([...(session?.seen || []), ...state.recent.slice(-6)]);
  const fresh = (arr) => arr.filter(s => !seen.has(s.id));
  const target = targetLevelFor(session ? session.asked : 0);
  let pool = [];
  // a miss comes back when it fits the current step of the ramp
  if (state.misses.length && Math.random() < 0.35) pool = fresh(state.misses.map(songById).filter(s => s && s.level === target));
  if (!pool.length) pool = fresh(levelPool(target));
  if (!pool.length) pool = fresh(SONGS.filter(s => Math.abs(s.level - target) <= 1));
  if (!pool.length) pool = SONGS.filter(s => s.level <= target + 1);
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeQuestion(song) {
  const key = parseKey(song.key);
  return {
    song, key, bassMode: false,           // the bass is never asked; the reveal and the hint teach it
    chords: song.chords,
    slots: song.chords.map(() => ({ rn: null, bass: 'root' })),
    active: 0, hint: false, bassHint: false, answered: false, result: null, startedAt: Date.now(),
  };
}

// ---------------------------------------------------------------- playback ----
function stopAll() {
  band.stop();
  spotify.pause();
  playback.playing = false;
  clearInterval(progressTimer); progressTimer = null;
  renderPlayButton();
}

async function playQuestion() {
  if (!q) return;
  band.stop();
  const song = q.song;
  const start = Math.max(0, (song.start || 0) + (state.offsets[song.id] || 0));
  const dur = song.dur || 24;
  if (spotify.ready && song.spotify) {
    try {
      playback.source = 'spotify'; playback.playing = true; renderPlayButton();
      await spotify.playSection(song.spotify, start * 1000, (start + dur) * 1000, {
        loop: true,
        onProgress: (pos) => { playback.progress = Math.min(1, Math.max(0, (pos / 1000 - start) / dur)); renderProgress(); },
      });
      return;
    } catch (e) {
      console.warn('spotify play failed, falling back to synth', e);
      toast('Spotify could not play this one, using the band instead.');
    }
  }
  playSynth({ loops: 2 });
}

function playSynth(opts = {}) {
  if (!q) return;
  band.ensure();
  spotify.pause();
  playback.source = 'synth'; playback.playing = true; renderPlayButton();
  const tempo = q.song.tempo || 100;
  const hl = opts.highlight !== false && q.answered;
  const handle = band.play(opts.chords || q.chords, q.key, {
    tempo, loops: opts.loops ?? 1, drums: state.settings.drums && (opts.drums ?? true),
    chords: opts.chordsOn ?? true, bass: opts.bassOn ?? true, rootPosition: opts.rootPosition ?? false,
    onChord: (i) => { if (hl) highlightChord(i); },
    onEnd: () => { playback.playing = false; renderPlayButton(); highlightChord(-1); },
  });
  const t0 = performance.now(); const total = handle.duration * 1000;
  clearInterval(progressTimer);
  progressTimer = setInterval(() => { playback.progress = Math.min(1, (performance.now() - t0) / total); renderProgress(); if (playback.progress >= 1) clearInterval(progressTimer); }, 100);
}

function highlightChord(i) {
  $$('.reveal .chip').forEach((el, k) => el.classList.toggle('now', k === i));
}

function togglePlay() {
  if (!q) return;
  if (playback.playing) { stopAll(); return; }
  if (playback.source === 'synth' && q.answered) playSynth({ loops: 1 });
  else playQuestion();
}

// ---------------------------------------------------------------- session ----
function startSession() {
  session = { startedAt: Date.now(), asked: 0, correct: 0, seen: [], lastSong: null, extra: false };
  nextQuestion();
}

function sessionSecondsLeft() {
  const total = state.settings.minutes * 60;
  return Math.max(0, total - Math.round((Date.now() - session.startedAt) / 1000));
}

function nextQuestion() {
  stopAll();
  const song = pickSong();
  q = makeQuestion(song);
  session.seen.push(song.id);
  state.recent = [...state.recent, song.id].slice(-12); save();
  render();
  playQuestion();
}

// Same song again with blank slots. Practice only: it does not count toward stats, misses or level-ups.
function retryQuestion() {
  if (!q) return;
  stopAll();
  const song = q.song;
  q = makeQuestion(song);
  q.retry = true;
  render();
  playQuestion();
}

function endSession() {
  stopAll();
  const rec = { date: today(), asked: session.asked, correct: session.correct, seconds: Math.round((Date.now() - session.startedAt) / 1000) };
  // merge into today's record if there already is one
  const existing = state.sessions.find(s => s.date === rec.date);
  if (existing) { existing.asked += rec.asked; existing.correct += rec.correct; existing.seconds += rec.seconds; }
  else state.sessions.push(rec);
  save();
  session.endedAt = Date.now();
  render();
}

// ---------------------------------------------------------------- answering ----
function setSlot(rn) {
  if (!q || q.answered) return;
  let i = q.active;
  if (i >= q.slots.length) i = q.slots.findIndex(s => !s.rn);
  if (i < 0) i = q.slots.length - 1;
  q.slots[i].rn = rn;
  q.active = Math.min(q.slots.length, i + 1);
  // advance to the next empty slot if any
  const nextEmpty = q.slots.findIndex((s, k) => k > i && !s.rn);
  q.active = nextEmpty >= 0 ? nextEmpty : (q.slots.every(s => s.rn) ? q.slots.length : q.active);
  renderAnswer();
}
function clearSlot() {
  if (!q || q.answered) return;
  let i = q.active < q.slots.length && q.slots[q.active].rn ? q.active : q.active - 1;
  if (i < 0) return;
  q.slots[i].rn = null; q.slots[i].bass = 'root'; q.active = i;
  renderAnswer();
}
// Bass hint: mark the slots where the bass is not on the root (counts as a hint, like the band).
function bassHint() {
  if (!q || q.answered) return;
  q.bassHint = true; q.hint = true;
  if (!hasInversions(q.song)) toast('The bass sits on the root for every chord here.');
  renderAnswer();
}

function grade() {
  if (!q || q.answered) return;
  const res = q.chords.map((c, i) => {
    const s = q.slots[i];
    const exact = !!s.rn && s.rn !== '?' && sameChord(s.rn, c.rn);
    const want = c.bass || 'root';
    let bassOk = !q.bassMode || (s.bass === want);
    let chordOk = exact, accepted = null;
    if (!exact) {
      // Relative pair over the same bass note (E/G# answered as C#m): the two chords share two of three
      // notes and the bass, and in a loop that never resolves the ear cannot be blamed for either label.
      const rel = relativePair(c, s);
      if (rel) { chordOk = true; bassOk = true; accepted = rel; }
    }
    return { chordOk, bassOk, accepted };
  });
  const chordsOk = res.every(r => r.chordOk);
  const bassOk = res.every(r => r.bassOk);
  const ok = chordsOk && bassOk;
  q.answered = true; q.result = { res, chordsOk, bassOk, ok };
  if (!q.retry) {
    session.asked++; if (ok) session.correct++; session.lastSong = q.song;
    state.history.push({ id: q.song.id, level: q.song.level, ok, chordsOk, bassOk, date: today(), hint: q.hint });
    if (!ok) { if (!state.misses.includes(q.song.id)) state.misses.push(q.song.id); }
    else state.misses = state.misses.filter(id => id !== q.song.id);
    maybeLevelUp();
    save();
  }
  stopAll();
  render();
  // celebrate a little
  if (ok) confetti();
}

function maybeLevelUp() {
  const atLevel = state.history.filter(x => x.level >= state.level).slice(-6);
  if (atLevel.length >= 6 && atLevel.filter(x => x.ok).length >= 5 && state.level < LEVELS.length) {
    state.level++;
    setTimeout(() => toast(`Level up! ${LEVELS[state.level - 1].name}`, 3500), 600);
  }
}

// Skip: a different song, nothing scored, and this one stays out of rotation for a while.
function skipQuestion() {
  if (!q || q.answered) return;
  state.recent = [...state.recent, q.song.id].slice(-12); save();
  nextQuestion();
}

function giveUp() {
  if (!q || q.answered) return;
  q.slots.forEach(s => { if (!s.rn) s.rn = '?'; });
  grade();
}

// ---------------------------------------------------------------- render ----
function render() {
  if (!session) return renderHome();
  if (session.endedAt) return renderSummary();
  renderQuestion();
}

function header() {
  const dots = weekDots().map(d => `<span class="dot ${d.done ? 'done' : ''} ${d.today ? 'today' : ''}" title="${d.d}">${d.label}</span>`).join('');
  const lvl = LEVELS[state.level - 1];
  return `<header class="top">
    <div class="brand"><span class="logo">♫</span><span class="name">${CONFIG.appName}</span></div>
    <div class="week" title="${weekCount()} of ${state.settings.weeklyGoal} sessions this week">${dots}</div>
    <div class="right">
      <button class="lvl" id="btn-level" title="Your level: ${h(lvl.blurb)} Click to change.">L${state.level} · ${h(lvl.name)} ▾</button>
      <button class="icon" id="btn-settings" aria-label="Settings">⚙</button>
    </div>
  </header>`;
}

function spotifyLine() {
  if (spotify.status === 'ready') return `<span class="ok">● Spotify connected${spotify.mode === 'connect' ? ` · playing on ${h(spotify.deviceName || 'a device')}` : ''}</span>`;
  if (spotify.status === 'connecting') return `<span class="muted">○ Connecting to Spotify…</span>`;
  if (spotify.loggedIn && spotify.status === 'error') return `<span class="warn">△ ${h(spotify.error || 'Spotify unavailable')}</span> <button class="link" id="btn-retry">retry</button>`;
  return `<button class="link" id="btn-login">Connect Spotify</button> <span class="muted">to hear the real recordings (Premium)</span>`;
}

function renderHome() {
  const n = weekCount(); const goal = state.settings.weeklyGoal;
  const lvl = LEVELS[state.level - 1];
  const totalAsked = state.history.length;
  const acc = totalAsked ? Math.round(100 * state.history.filter(x => x.ok).length / totalAsked) : null;
  app.innerHTML = `${header()}
  <main class="home">
    <section class="hero">
      <h1>Hear the changes.</h1>
      <p class="lede">A real song plays. You name the chords. ${state.settings.minutes} minutes, then go play guitar.</p>
      <button class="primary big" id="btn-start">Start today’s session</button>
      <p class="status">${spotifyLine()}</p>
    </section>
    <section class="cards">
      <div class="card stat"><div class="k">This week</div><div class="v">${n}<span class="of">/${goal}</span></div><div class="s">${n >= goal ? 'Goal met. Nice.' : `${goal - n} more to hit your goal`}</div></div>
      <div class="card stat"><div class="k">Level ${state.level}</div><div class="v small">${h(lvl.name)}</div><div class="s">${h(lvl.blurb)}</div></div>
      <div class="card stat"><div class="k">All time</div><div class="v">${acc === null ? '—' : acc + '%'}</div><div class="s">${totalAsked} progressions · ${state.misses.length} to revisit</div></div>
    </section>
    <section class="how">
      <h2>How it works</h2>
      <ol>
        <li><b>Listen.</b> A section of a real song loops. The key is shown; tap <i>hear the key</i> for a cadence.</li>
        <li><b>Name the chords</b> as Roman numerals (I, IV, V, vi…). You never have to name the bass note; from level 4 a <i>bass hint</i> shows which chords have the bass off the root, and the reveal explains it.</li>
        <li><b>Check.</b> Then use the band to hear the bass alone, or hear your guess against the real thing.</li>
      </ol>
    </section>
  </main>`;
  bindCommon();
  $('#btn-start').onclick = async () => {
    band.ensure();
    // give Spotify a moment to come up, but never make the button feel dead
    await Promise.race([spotify.connect(), new Promise(r => setTimeout(r, 3500))]);
    startSession();
  };
}

function renderQuestion() {
  const song = q.song;
  const lvl = LEVELS[q.song.level - 1];
  const secs = sessionSecondsLeft();
  const pct = 100 * (1 - secs / (state.settings.minutes * 60));
  app.innerHTML = `${header()}
  <main class="play">
    <div class="timer" title="${Math.ceil(secs / 60)} min left"><div class="bar" style="width:${pct}%"></div></div>
    <div class="qhead">
      <span class="qn">Q${session.asked + (q.answered || q.retry ? 0 : 1)}${q.retry ? ' <span class="muted small">again</span>' : ''}</span>
      <span class="badge level" title="This question’s level">L${q.song.level} · ${h(lvl.name)}</span>
      ${state.settings.showKey || q.answered ? `<span class="badge key">Key of ${h(keyDisplay(q.key))}</span>` : `<span class="badge key muted">Key hidden</span>`}
      <button class="chipbtn" id="btn-key" title="Play a cadence in this key">♪ hear the key</button>
      <span class="grow"></span>
      <span class="src ${playback.source}">${playback.source === 'spotify' ? '● live recording' : playback.source === 'synth' ? '● band' : ''}</span>
    </div>
    <section class="player">
      <button class="playbtn" id="btn-play" aria-label="Play / pause"><span class="ico">${playback.playing ? '❚❚' : '▶'}</span></button>
      <div class="pbar"><div class="pfill" style="width:${Math.round(playback.progress * 100)}%"></div></div>
      <div class="pmeta">${q.answered ? `<b>${h(song.title)}</b> · ${h(song.artist)}` : `<span class="muted">${h(song.section || 'section')} · ${song.chords.length} chords · ${Math.round(totalBeats(song) / (song.chords[0].beats % 3 === 0 && song.chords[0].beats % 4 !== 0 ? 3 : 4))} bars</span>`}</div>
    </section>
    <section class="answer" id="answer"></section>
    <section class="reveal" id="reveal"></section>
  </main>`;
  bindCommon();
  $('#btn-play').onclick = togglePlay;
  $('#btn-key').onclick = () => { band.ensure(); band.playKey(q.key); spotify.pause(); playback.playing = false; renderPlayButton(); };
  renderAnswer();
  renderReveal();
}

function paletteFor() {
  const mode = q.key.mode;
  const pal = PALETTES[mode];
  const rows = [pal.diatonic];
  if (q.song.level >= 3) rows.push(pal.borrowed);
  return rows;
}

function label(rn) {
  if (rn === '?') return '—';
  if (state.settings.notation === 'letters') {
    try { return chordInfo({ rn }, q.key).name; } catch { return rn; }
  }
  return rn;
}

function renderAnswer() {
  const el = $('#answer'); if (!el || !q) return;
  if (q.answered) { el.innerHTML = ''; return; }
  const slots = q.slots.map((s, i) => {
    const c = q.chords[i]; const w = (c.beats || 4);
    return `<div class="slot ${i === q.active ? 'active' : ''} ${s.rn ? 'filled' : ''}" data-i="${i}" style="flex:${w}">
      <div class="rn">${s.rn ? h(label(s.rn)) : '<span class="ph">·</span>'}</div>
      ${q.bassHint && c.bass && c.bass !== 'root' ? `<div class="bhint" title="The bass is not on the root of this chord">bass off root</div>` : ''}
      <div class="bars">${barsLabel(w)}</div>
    </div>`;
  }).join('');
  const rows = paletteFor().map((row, ri) => `<div class="prow ${ri ? 'borrowed' : ''}">${row.map((rn, k) => `<button class="pal" data-rn="${h(rn)}" title="${ri === 0 ? 'key ' + (k + 1) : ''}">${h(label(rn))}${ri === 0 ? `<kbd>${k + 1}</kbd>` : ''}</button>`).join('')}</div>`).join('');
  const complete = q.slots.every(s => s.rn);
  el.innerHTML = `
    <div class="slots">${slots}</div>
    <div class="palette">${rows}</div>
    <div class="actions">
      ${q.song.level >= 4 ? `<button class="ghost" id="btn-bhint" title="Show which chords have the bass off the root (counts as a hint, B)" ${q.bassHint ? 'disabled' : ''}>bass hint</button>` : ''}
      <span class="grow"></span>
      <button class="ghost" id="btn-skip" title="Different song (not scored, S)">skip</button>
      <button class="ghost" id="btn-giveup">show me</button>
      <button class="primary" id="btn-check" ${complete ? '' : 'disabled'}>Check</button>
    </div>`;
  $$('.pal', el).forEach(b => b.onclick = () => setSlot(b.dataset.rn));
  $$('.slot', el).forEach(s => s.onclick = () => { q.active = +s.dataset.i; renderAnswer(); });
  const bh = $('#btn-bhint'); if (bh) bh.onclick = bassHint;
  $('#btn-check').onclick = grade;
  $('#btn-giveup').onclick = giveUp;
  $('#btn-skip').onclick = skipQuestion;
}

// Accept a relative major/minor over the same bass note: a first-inversion major chord (V/3, I/3, IV/3) heard as
// the minor chord a minor third below (iii, vi, ii), or the reverse (iii/5 heard as V). Below level 4 the bass is
// not asked, so the guess only has to be the relative chord; at level 4+ the guess's bass must land on the same note.
function relativePair(truth, slot) {
  if (!slot.rn || slot.rn === '?') return null;
  let t, g;
  try { t = chordInfo(truth, q.key); g = chordInfo({ rn: slot.rn, bass: q.bassMode ? slot.bass : undefined }, q.key); } catch { return null; }
  if (t.intervals.length !== 3 || g.intervals.length !== 3) return null;
  const relative = (t.quality === 'maj' && g.quality === 'min' && (t.rootPc - g.rootPc + 12) % 12 === 3)
                || (t.quality === 'min' && g.quality === 'maj' && (g.rootPc - t.rootPc + 12) % 12 === 3);
  if (!relative) return null;
  // the truth must be an inversion whose bass is shared: E/G# vs C#m (G# is E's 3rd and C#m's 5th)
  if ((t.bass || 'root') === 'root') return null;
  if (q.bassMode) {
    if (g.bassPc !== t.bassPc) return null;
  } else {
    const gp = g.intervals.map(i => (g.rootPc + i) % 12);
    if (!gp.includes(t.bassPc)) return null;
  }
  const bassName = pcName(t.bassPc, q.key);
  return `Accepted: the chart spells it ${t.name}, you heard ${g.name}. Over ${bassName} in the bass they share two notes, and here the chord passes rather than resolves, so either name is fair.`;
}

// A wrong answer that shares two notes with the right chord and contains its bass note is a "near miss":
// typically an inversion heard as the chord a third away (E/G# heard as C#m). Explain rather than just mark it wrong.
function nearMiss(correct, guessRn) {
  if (!guessRn || guessRn === '?') return null;
  let g; try { g = chordInfo({ rn: guessRn }, q.key); } catch { return null; }
  const c = chordInfo(correct, q.key);
  const cp = new Set(c.intervals.map(i => (c.rootPc + i) % 12));
  const gp = new Set(g.intervals.map(i => (g.rootPc + i) % 12));
  const shared = [...cp].filter(p => gp.has(p));
  if (shared.length < 2 || !gp.has(c.bassPc)) return null;
  const only = [...cp].filter(p => !gp.has(p)).map(p => pcName(p, q.key));
  const bassNote = pcName(c.bassPc, q.key);
  return `Close. ${c.name} and ${g.name} share ${shared.map(p => pcName(p, q.key)).join(' and ')}, and ${bassNote} is in the bass of both. The ${only.join(', ')} is what makes it ${c.name}.`;
}

function chordChip(c, i, res) {
  const info = chordInfo(c, q.key);
  const guess = q.slots[i];
  const near = res && !res.chordOk ? nearMiss(c, guess.rn) : null;
  const cls = res ? (res.chordOk && res.bassOk ? 'good' : (res.chordOk || near) ? 'half' : 'bad') : '';
  const guessTxt = res && (res.accepted || !(res.chordOk && res.bassOk)) && guess.rn && guess.rn !== '?' ? `<div class="guess ${res.accepted ? 'ok' : ''}">you: ${h(guess.rn === '?' ? '—' : label(guess.rn))}${q.bassMode && guess.bass !== 'root' ? '/' + guess.bass : ''}</div>` : '';
  return `<div class="chip ${cls}" style="flex:${c.beats || 4}">
    <div class="name">${h(info.name)}</div>
    <div class="rn">${h(rnDisplay(c))}</div>
    ${c.bass && c.bass !== 'root' ? `<div class="bassnote">bass on the ${c.bass === '3' ? '3rd' : c.bass === '5' ? '5th' : '7th'}</div>` : ''}
    ${guessTxt}
  </div>`;
}

function nearMissNotes() {
  if (!q?.result) return '';
  const notes = q.chords.map((c, i) => q.result.res[i].accepted || (q.result.res[i].chordOk ? null : nearMiss(c, q.slots[i].rn))).filter(Boolean);
  return notes.length ? `<p class="near">${notes.map(h).join(' ')}</p>` : '';
}

function renderReveal() {
  const el = $('#reveal'); if (!el || !q) return;
  if (!q.answered) { el.innerHTML = ''; return; }
  const song = q.song; const r = q.result;
  const chips = q.chords.map((c, i) => chordChip(c, i, r.res[i])).join('');
  const verdict = (r.ok ? 'Yes!' : 'Not quite.') + (q.retry ? ' <span class="muted small">(retry, not scored)</span>' : '');
  const inv = hasInversions(song);
  const guessChords = q.slots.every(s => s.rn && s.rn !== '?') ? q.slots.map((s, i) => ({ rn: s.rn, bass: q.bassMode ? s.bass : 'root', beats: q.chords[i].beats })) : null;
  const secsLeft = sessionSecondsLeft();
  const art = song.art ? `<img class="art" src="${h(song.art)}" alt="">` : '';
  const ug = song.ug || `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(song.title + ' ' + song.artist)}`;
  el.innerHTML = `
    <div class="verdict ${r.ok ? 'ok' : 'no'}">${verdict}</div>
    <div class="chips">${chips}</div>
    ${nearMissNotes()}
    ${song.note ? `<p class="note">${h(song.note)}</p>` : ''}
    ${(() => { const ex = explain(q.chords, q.key); return `<div class="about"><div class="k">About ${h(ex.name)}</div><p>${h(ex.text)}</p></div>`; })()}
    <div class="tools">
      <button class="tool" data-tool="band">▶ band</button>
      <button class="tool" data-tool="bass">▶ bass only</button>
      ${inv ? `<button class="tool" data-tool="root">▶ bass on roots</button><button class="tool" data-tool="written">▶ bass as written</button>` : ''}
      ${guessChords && !r.ok ? `<button class="tool" data-tool="guess">▶ your guess</button>` : ''}
      <button class="tool" data-tool="record">▶ recording</button>
    </div>
    <div class="song">
      ${art}
      <div class="meta">
        <div class="t">${h(song.title)}</div>
        <div class="a">${h(song.artist)}${song.year ? ' · ' + song.year : ''}</div>
        <div class="links">
          ${song.spotify ? `<a href="https://open.spotify.com/track/${song.spotify.split(':').pop()}" target="_blank" rel="noopener">Open in Spotify</a>` : ''}
          <a href="${h(ug)}" target="_blank" rel="noopener">${song.src === 'official' ? 'Official chart on Ultimate Guitar' : 'Chords on Ultimate Guitar'}</a>
          <span class="nudge">section timing: <button class="link" data-nudge="-5">−5s</button> <button class="link" data-nudge="5">+5s</button>${state.offsets[song.id] ? ` <span class="muted">(${state.offsets[song.id] > 0 ? '+' : ''}${state.offsets[song.id]}s)</span>` : ''}</span>
        </div>
      </div>
    </div>
    <div class="actions">
      <span class="muted">${secsLeft > 0 ? `${Math.ceil(secsLeft / 60)} min left` : 'time’s up'}</span>
      <span class="grow"></span>
      <button class="ghost" id="btn-retry-q" title="Same song, blank slots (R)">↺ Try again</button>
      ${secsLeft > 0 ? `<button class="primary" id="btn-next">Next ›</button>` : `<button class="ghost" id="btn-next">one more</button><button class="primary" id="btn-finish">Finish</button>`}
    </div>`;
  $$('.tool', el).forEach(b => b.onclick = () => {
    const t = b.dataset.tool;
    if (t === 'band') playSynth({ loops: 1 });
    if (t === 'bass') playSynth({ loops: 1, chordsOn: false });
    if (t === 'root') playSynth({ loops: 1, rootPosition: true });
    if (t === 'written') playSynth({ loops: 1, rootPosition: false });
    if (t === 'guess') playSynth({ loops: 1, chords: guessChords });
    if (t === 'record') playQuestion();
  });
  $$('[data-nudge]', el).forEach(b => b.onclick = () => { state.offsets[song.id] = (state.offsets[song.id] || 0) + (+b.dataset.nudge); save(); renderReveal(); playQuestion(); });
  const next = $('#btn-next'); if (next) next.onclick = nextQuestion;
  $('#btn-retry-q').onclick = retryQuestion;
  const fin = $('#btn-finish'); if (fin) fin.onclick = endSession;
}

function renderPlayButton() {
  const b = $('#btn-play .ico'); if (b) b.textContent = playback.playing ? '❚❚' : '▶';
  const s = $('.src'); if (s) { s.className = 'src ' + playback.source; s.textContent = playback.source === 'spotify' ? '● live recording' : playback.source === 'synth' ? '● band' : ''; }
}
function renderProgress() { const f = $('.pfill'); if (f) f.style.width = Math.round(playback.progress * 100) + '%'; }

function renderSummary() {
  const s = session; const last = s.lastSong;
  const n = weekCount(); const goal = state.settings.weeklyGoal;
  let handoff = '';
  if (last) {
    const key = parseKey(last.key);
    const line = last.chords.map(c => chordInfo(c, key).name).join('  ·  ');
    const rn = last.chords.map(c => rnDisplay(c)).join('  ·  ');
    handoff = `<section class="card handoff">
      <div class="k">Take it to the guitar</div>
      <div class="t">${h(last.title)} <span class="muted">· ${h(last.artist)} · key of ${h(keyDisplay(key))}</span></div>
      <div class="line">${h(line)}</div>
      <div class="rnline">${h(rn)}</div>
      <p class="muted">Play it now, sing the bass notes, then move on to whatever you were going to play.</p>
    </section>`;
  }
  app.innerHTML = `${header()}
  <main class="summary">
    <h1>${s.correct === s.asked && s.asked > 0 ? 'Clean sweep.' : s.correct >= s.asked / 2 ? 'Good session.' : 'Ears warmed up.'}</h1>
    <p class="lede">${s.correct} of ${s.asked} progressions · ${Math.round((Date.now() - s.startedAt) / 60000)} min · ${n}/${goal} sessions this week${n >= goal ? ' · goal met' : ''}</p>
    ${handoff}
    <div class="actions center">
      <button class="ghost" id="btn-more">One more question</button>
      <button class="primary" id="btn-home">Done</button>
    </div>
  </main>`;
  bindCommon();
  $('#btn-more').onclick = () => { session.endedAt = null; session.startedAt = Date.now() - (state.settings.minutes * 60 - 30) * 1000; nextQuestion(); };
  $('#btn-home').onclick = () => { session = null; q = null; render(); };
}

// ---------------------------------------------------------------- settings ----
function openSettings() {
  const s = state.settings;
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="sheet">
    <div class="sh"><h2>Settings</h2><button class="icon" id="btn-close">✕</button></div>
    <label>Notation
      <select id="s-notation"><option value="roman" ${s.notation === 'roman' ? 'selected' : ''}>Roman numerals (I, IV, V)</option><option value="letters" ${s.notation === 'letters' ? 'selected' : ''}>Chord names (A, D, E)</option></select></label>
    <label>Session length <select id="s-min">${[3, 5, 8, 10].map(n => `<option value="${n}" ${s.minutes === n ? 'selected' : ''}>${n} minutes</option>`).join('')}</select></label>
    <label>Weekly goal <select id="s-goal">${[2, 3, 4, 5, 7].map(n => `<option value="${n}" ${s.weeklyGoal === n ? 'selected' : ''}>${n} sessions</option>`).join('')}</select></label>
    <label>Level <select id="s-level">${LEVELS.map(l => `<option value="${l.n}" ${state.level === l.n ? 'selected' : ''}>${l.n} · ${h(l.name)}</option>`).join('')}</select></label>
    <label class="row"><input type="checkbox" id="s-drums" ${s.drums ? 'checked' : ''}> Drums in the band</label>
    <label class="row"><input type="checkbox" id="s-key" ${s.showKey ? 'checked' : ''}> Show the key before answering</label>
    <div class="sp">
      <div>Spotify: ${spotify.loggedIn ? (spotify.status === 'ready' ? 'connected' : spotify.status === 'error' ? 'error — ' + h(spotify.error || '') : 'logged in') : 'not connected'}</div>
      ${spotify.loggedIn ? `<button class="ghost" id="s-logout">Disconnect</button>` : `<button class="ghost" id="s-login">Connect Spotify</button>`}
      <p class="muted small">Playback needs Spotify Premium. Redirect URI for this page: <code>${h(CONFIG.redirectUri)}</code></p>
      ${spotify.loggedIn ? `<div class="devices" id="s-devices"><span class="muted small">Play on: ${spotify.mode === 'sdk' ? 'this browser' : h(spotify.deviceName || '—')}</span> <button class="ghost small" id="s-devs">choose device…</button></div>` : ''}
    </div>
    <div class="sp">
      <button class="ghost" id="s-export">Export progress</button>
      <button class="ghost danger" id="s-reset">Reset progress</button>
    </div>
  </div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  $('#btn-close', m).onclick = close; m.onclick = (e) => { if (e.target === m) close(); };
  $('#s-notation', m).onchange = (e) => { s.notation = e.target.value; save(); renderAnswer(); };
  $('#s-min', m).onchange = (e) => { s.minutes = +e.target.value; save(); };
  $('#s-goal', m).onchange = (e) => { s.weeklyGoal = +e.target.value; save(); };
  $('#s-level', m).onchange = (e) => { state.level = +e.target.value; save(); render(); };
  $('#s-drums', m).onchange = (e) => { s.drums = e.target.checked; save(); };
  $('#s-key', m).onchange = (e) => { s.showKey = e.target.checked; save(); render(); };
  const lo = $('#s-logout', m); if (lo) lo.onclick = () => { spotify.logout(); close(); render(); };
  const dv = $('#s-devs', m); if (dv) dv.onclick = async () => {
    dv.textContent = 'looking…';
    const devs = await spotify.listDevices();
    const box = $('#s-devices', m);
    if (!devs.length) { box.innerHTML = `<span class="muted small">No Spotify devices found. Open the Spotify app on your phone, press play on anything, then try again.</span> <button class="ghost small" id="s-devs">retry</button>`; $('#s-devs', m).onclick = dv.onclick; return; }
    box.innerHTML = `<span class="muted small">Play on:</span> ` + devs.map(d => `<button class="ghost small devopt" data-id="${h(d.id)}">${h(d.name)}${d.is_active ? ' ●' : ''}</button>`).join(' ') + (Spotify.sdkSupported() ? ` <button class="ghost small" id="s-dev-sdk">this browser</button>` : '');
    $$('.devopt', box).forEach(b => b.onclick = async () => { await spotify.useDevice(b.dataset.id); toast(`Playing on ${spotify.deviceName}`); close(); render(); });
    const sdkb = $('#s-dev-sdk', box); if (sdkb) sdkb.onclick = async () => { try { localStorage.removeItem('ct.spotify.device'); } catch {} spotify.ready = false; spotify.mode = null; spotify.status = 'idle'; await spotify.connect(); close(); render(); };
  };
  const li = $('#s-login', m); if (li) li.onclick = () => spotify.login();
  $('#s-export', m).onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `changes-progress-${today()}.json`; a.click();
  };
  $('#s-reset', m).onclick = () => { if (confirm('Reset all progress? This cannot be undone.')) { state = defaults(); save(); close(); session = null; render(); } };
}

function openLevelPicker() {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="sheet">
    <div class="sh"><h2>Your level</h2><button class="icon" id="btn-close">✕</button></div>
    <p class="muted small">Each session ramps: two questions one level down, two at your level, then one level up. Pick where the middle sits.</p>
    <div class="levels">${LEVELS.map(l => `<button class="lvlopt ${l.n === state.level ? 'on' : ''}" data-n="${l.n}"><b>L${l.n} · ${h(l.name)}</b><span>${h(l.blurb)}</span></button>`).join('')}</div>
  </div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  $('#btn-close', m).onclick = close; m.onclick = (e) => { if (e.target === m) close(); };
  $$('.lvlopt', m).forEach(b => b.onclick = () => { state.level = +b.dataset.n; save(); close(); render(); toast(`Level ${state.level}: ${LEVELS[state.level - 1].name}`); });
}

function bindCommon() {
  const s = $('#btn-settings'); if (s) s.onclick = openSettings;
  const lv = $('#btn-level'); if (lv) lv.onclick = openLevelPicker;
  const l = $('#btn-login'); if (l) l.onclick = () => spotify.login();
  const r = $('#btn-retry'); if (r) r.onclick = async () => { spotify.status = 'idle'; await spotify.connect(); render(); };
}

// iOS suspends the audio context when the page is backgrounded or another app takes audio; wake it on the next tap
document.addEventListener('touchend', () => { if (band.ctx && band.ctx.state !== 'running') band.ctx.resume(); }, { passive: true });

// ---------------------------------------------------------------- keyboard ----
document.addEventListener('keydown', (e) => {
  if (e.target.matches('input,select,textarea')) return;
  if (!q) return;
  if (e.key === ' ') { e.preventDefault(); togglePlay(); return; }
  if (q.answered) {
    if (e.key === 'Enter') { e.preventDefault(); const n = $('#btn-next'); n && n.click(); }
    if (e.key === 'r' || e.key === 'R') { e.preventDefault(); retryQuestion(); }
    return;
  }
  const pal = paletteFor()[0];
  if (/^[1-7]$/.test(e.key) && pal[+e.key - 1]) { setSlot(pal[+e.key - 1]); return; }
  if (e.key === 'Backspace') { e.preventDefault(); clearSlot(); return; }
  if (e.key === 'Enter') { e.preventDefault(); if (q.slots.every(s => s.rn)) grade(); return; }
  if (e.key === 'b' || e.key === 'B') { bassHint(); }
  if (e.key === 's' || e.key === 'S') { skipQuestion(); }
});

// ---------------------------------------------------------------- confetti ----
function confetti() {
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const ctx = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const P = Array.from({ length: 70 }, () => ({ x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 3, r: 3 + Math.random() * 4, h: Math.random() * 360, a: 1 }));
  let t = 0;
  (function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.a -= 0.012; ctx.fillStyle = `hsla(${p.h},85%,60%,${Math.max(0, p.a)})`; ctx.fillRect(p.x, p.y, p.r, p.r * 1.6); });
    if (++t < 90) requestAnimationFrame(frame); else c.remove();
  })();
}

// ---------------------------------------------------------------- boot ----
(async function boot() {
  spotify.onStatus = () => { const el = $('.status'); if (el) el.innerHTML = spotifyLine(), bindCommon(); };
  const handled = await spotify.handleRedirect();
  if (spotify.error) toast(spotify.error, 5000);
  render();
  if (spotify.loggedIn) spotify.connect().then(() => { if (!session) render(); });
  if (handled && spotify.loggedIn) toast('Spotify connected.');
  // keep the session clock honest
  setInterval(() => { if (session && !session.endedAt && q && !q.answered) { const b = $('.timer .bar'); if (b) b.style.width = (100 * (1 - sessionSecondsLeft() / (state.settings.minutes * 60))) + '%'; } }, 1000);
})();
