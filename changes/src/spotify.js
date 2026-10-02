// spotify.js — PKCE login (no secret) + Spotify Connect: play/pause commands to whatever device Spotify is using.
// Requires Spotify Premium for playback. Redirect URI must be registered in the Spotify dashboard.

const SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
const AUTH = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const API = 'https://api.spotify.com/v1';
const LS_TOKEN = 'ct.spotify.token';
const LS_VERIFIER = 'ct.spotify.verifier';

function b64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function pkcePair() {
  const arr = new Uint8Array(64); crypto.getRandomValues(arr);
  const verifier = b64url(arr);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: b64url(digest) };
}

export class Spotify {
  constructor({ clientId, redirectUri }) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.ready = false;
    this.status = 'idle'; // idle | connecting | ready | error
    this.error = null;
    this.onStatus = () => {};
    this.loop = null;
    this.premium = null;
    this.device = null;      // the device the last play command went to (Connect mode)
    this.player = null;      // Web Playback SDK player (computers)
    this.sdkId = null;       // its device id
    this.chain = Promise.resolve();   // play/pause commands run one at a time, in order
    this.log = [];                    // last Spotify calls, for the diagnostics panel
    this.onPlaying = () => {};        // (bool) Spotify started/stopped playing our section outside our own commands
    this.pending = null;              // section whose play command is in flight
    this.monitorTimer = null;
    document.addEventListener('visibilitychange', () => { if (!document.hidden && this.section && !this.player) this.tick().catch(() => {}); });
  }


  // On computers the page itself is the Spotify player (Web Playback SDK), as it was originally. The SDK does
  // not run on iOS/iPadOS, so phones send commands to the Spotify app instead (Connect).
  static onPhone() {
    const ua = navigator.userAgent || '';
    return /iPhone|iPad|iPod|Android/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  static sdkSupported() {
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return !ios && typeof window.MediaSource !== 'undefined';
  }

  loadSdk() {
    if (window.Spotify) return Promise.resolve();
    return new Promise((resolve, reject) => {
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
      const s = document.createElement('script');
      s.src = 'https://sdk.scdn.co/spotify-player.js'; s.async = true;
      s.onerror = () => reject(new Error('Could not load the Spotify player script.'));
      document.head.appendChild(s);
    });
  }

  // ---- auth -----------------------------------------------------------------

  get token() {
    try { return JSON.parse(localStorage.getItem(LS_TOKEN) || 'null'); } catch { return null; }
  }
  set token(t) {
    try { t ? localStorage.setItem(LS_TOKEN, JSON.stringify(t)) : localStorage.removeItem(LS_TOKEN); } catch { /* private mode */ }
  }
  get loggedIn() { return !!this.token?.refresh_token; }

  async login() {
    const { verifier, challenge } = await pkcePair();
    try { localStorage.setItem(LS_VERIFIER, verifier); } catch { /* ignore */ }
    const p = new URLSearchParams({
      client_id: this.clientId, response_type: 'code', redirect_uri: this.redirectUri,
      scope: SCOPES, code_challenge_method: 'S256', code_challenge: challenge,
    });
    location.assign(`${AUTH}?${p}`);
  }

  logout() { this.token = null; this.stopLoop(); this.stopMonitor(); try { this.player?.disconnect(); } catch { /* ignore */ } this.player = null; this.ready = false; this.status = 'idle'; this.onStatus(); }

  // Call on page load: completes the redirect if ?code= is present. Returns true if it handled one.
  async handleRedirect() {
    const u = new URL(location.href);
    const code = u.searchParams.get('code');
    const err = u.searchParams.get('error');
    if (!code && !err) return false;
    const path = /\/callback$/.test(u.pathname) ? u.pathname.replace(/callback$/, '') : u.pathname;
    history.replaceState({}, '', path + u.hash);
    if (err) { this.error = 'Spotify login was cancelled (' + err + ').'; return true; }
    const verifier = localStorage.getItem(LS_VERIFIER);
    const body = new URLSearchParams({
      client_id: this.clientId, grant_type: 'authorization_code', code, redirect_uri: this.redirectUri, code_verifier: verifier,
    });
    const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const t = await r.json();
    if (!r.ok) { this.error = 'Token exchange failed: ' + (t.error_description || r.status); return true; }
    t.expires_at = Date.now() + (t.expires_in - 60) * 1000;
    this.token = t;
    return true;
  }

  async accessToken() {
    let t = this.token;
    if (!t) return null;
    if (Date.now() < (t.expires_at || 0)) return t.access_token;
    const body = new URLSearchParams({ client_id: this.clientId, grant_type: 'refresh_token', refresh_token: t.refresh_token });
    const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!r.ok) { this.token = null; return null; }
    const n = await r.json();
    n.refresh_token = n.refresh_token || t.refresh_token;
    n.expires_at = Date.now() + (n.expires_in - 60) * 1000;
    this.token = n;
    return n.access_token;
  }

  note(line) { this.log.push(new Date().toTimeString().slice(0, 8) + ' ' + line); if (this.log.length > 20) this.log.shift(); }

  async api(path, opts = {}) {
    const tok = await this.accessToken();
    if (!tok) throw new Error('not logged in');
    const label = (opts.method || 'GET') + ' ' + path.replace(/device_id=[^&]*/, 'device_id=…');
    let r;
    try { r = await fetch(API + path, { ...opts, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', ...(opts.headers || {}) } }); }
    catch (e) { this.note(`${label} -> network error ${e.message}`); throw e; }
    if (r.status === 204) { this.note(`${label} -> 204`); return null; }
    const text = await r.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) { this.note(`${label} -> ${r.status} ${data?.error?.message || data?.error?.reason || ''}`); const e = new Error(data?.error?.message || ('Spotify ' + r.status)); e.status = r.status; e.data = data; throw e; }
    if (path === '/me/player' && !opts.method) return data;
    if (path === '/me/player/devices') this.note(`${label} -> ${(data?.devices || []).map(d => `${d.name} [${d.type}${d.is_active ? ', active' : ''}]`).join('; ') || 'no devices'}`);
    else this.note(`${label} -> ${r.status}`);
    return data;
  }

  // What Spotify reports right now plus the recent call log, for bug reports.
  async diagnostics() {
    let devs = 'n/a';
    try { devs = ((await this.api('/me/player/devices'))?.devices || []).map(d => `${d.name} [${d.type}${d.is_active ? ', ACTIVE' : ''}${d.is_restricted ? ', restricted' : ''}]`).join('\n  ') || 'none'; } catch (e) { devs = 'error ' + e.message; }
    const last = this.lastDevice;
    return [
      `page: ${location.href}`, `ua: ${navigator.userAgent}`, `status: ${this.status}${this.error ? ' (' + this.error + ')' : ''}`,
      `premium: ${this.premium}`, `player: ${this.player ? 'this browser (SDK)' : 'Spotify Connect'}`, `last device: ${last ? last.name : 'none'}`, `devices now:\n  ${devs}`, '', 'recent calls:', ...this.log,
    ].join('\n');
  }

  async me() { return this.api('/me'); }

  // ---- playback ---------------------------------------------------------------
  // The app never chooses where Spotify plays. Every command goes to Spotify's active device, the one the user
  // last pressed play on in the Spotify app. Spotify forgets its active device after a while idle and refuses
  // to play (404), so we quietly note the device id whenever something plays and resume on it in that case.

  async connect() {
    if (this.ready) return true;
    if (!this.loggedIn) return false;
    if (this.connecting) return this.connecting;   // never run two connects at once
    this.connecting = this._connect().finally(() => { this.connecting = null; });
    return this.connecting;
  }

  async _connect() {
    this.status = 'connecting'; this.onStatus();
    try {
      const me = await this.me();
      this.premium = me.product === 'premium';
      if (!this.premium) { this.status = 'error'; this.error = 'Spotify playback needs a Premium account. The synth band will play instead.'; this.onStatus(); return false; }
      if (Spotify.sdkSupported()) await this.startSdk();   // falls back to Connect if it cannot start
      this.ready = true; this.status = 'ready'; this.error = null; this.onStatus();
      return true;
    } catch (e) {
      this.status = 'error'; this.error = 'Could not reach Spotify.'; this.onStatus();
      return false;
    }
  }

  async startSdk() {
    try {
      await this.loadSdk();
      const player = new window.Spotify.Player({ name: 'Changes (this browser)', getOAuthToken: cb => this.accessToken().then(cb), volume: 0.9 });
      const ready = new Promise((resolve, reject) => {
        player.addListener('ready', ({ device_id }) => { this.sdkId = device_id; resolve(); });
        player.addListener('not_ready', () => { this.note('sdk not_ready'); });
        player.addListener('initialization_error', ({ message }) => reject(new Error(message)));
        player.addListener('authentication_error', ({ message }) => reject(new Error(message)));
        player.addListener('account_error', ({ message }) => reject(new Error(message)));
        player.addListener('playback_error', ({ message }) => { this.note('sdk playback_error ' + message); });
        setTimeout(() => reject(new Error('Spotify player timed out')), 15000);
      });
      if (!(await player.connect())) throw new Error('player.connect() failed');
      await ready;
      this.player = player; this.note('sdk ready');
    } catch (e) {
      this.note('sdk failed: ' + e.message + ' (using Spotify Connect)');
      this.player = null; this.sdkId = null;
    }
  }

  get lastDevice() { try { return JSON.parse(localStorage.getItem('ct.spotify.last') || 'null'); } catch { return null; } }
  rememberDevice(d) { if (d?.id) { try { localStorage.setItem('ct.spotify.last', JSON.stringify({ id: d.id, name: d.name })); } catch { /* ignore */ } } }

  // The device to send a command to. On a phone: this phone, always (never a laptop tab or a speaker). Elsewhere
  // in Connect mode: Spotify's own active device, or the one it last played on.
  async targetDevice() {
    let devs = []; try { devs = (await this.api('/me/player/devices'))?.devices || []; } catch { /* none */ }
    if (Spotify.onPhone()) {
      const phones = devs.filter(d => d.type === 'Smartphone');
      return phones.find(d => d.is_active) || phones[0] || null;
    }
    const last = this.lastDevice;
    return devs.find(d => d.is_active) || (last && (devs.find(d => d.id === last.id) || devs.find(d => d.name === last.name))) || null;
  }

  asleep() {
    this.status = 'error';
    this.error = 'Spotify isn’t responding. Open Spotify, press play on anything, then come back.';
    this.onStatus();
  }

  // Play a track section [startMs, endMs) and loop it until stop(). fromMs starts the first pass partway in (a seek).
  // One play command per loop cycle and a local clock for the progress bar. A light monitor (GET /me/player
  // every few seconds while the page is visible) keeps us honest about what Spotify is really doing: if the
  // phone loaded the track but did not start it, we nudge it once with a plain resume; if Spotify is paused or
  // playing from the Spotify app, the play button follows (onPlaying) and the clock re-syncs.
  // Run fn after every earlier play/pause has finished, so a pause for the old song can never land after the
  // play for the new one (that is what made Skip stop playback).
  serial(fn) { const run = this.chain.then(fn, fn); this.chain = run.catch(() => {}); return run; }

  async playSection(uri, startMs, endMs, { loop = true, onProgress, fromMs } = {}) {
    if (!this.ready) throw new Error('player not ready');
    this.stopLoop();
    const section = this.newSection(uri, startMs, endMs, { loop, onProgress });
    if (this.player) return this.playSectionSdk(section, fromMs);
    section.nextFrom = Math.min(endMs - 200, Math.max(startMs, fromMs ?? startMs));
    await this.cycle(section);
  }

  newSection(uri, startMs, endMs, { loop = true, onProgress } = {}) {
    const section = { uri, startMs, endMs, loop, onProgress, nudged: false, seenPlaying: false, playedAt: 0, nextFrom: startMs };
    section.restart = () => this.cycle(section).catch(() => this.stopLoop());
    this.section = section;
    return section;
  }

  // One play command for the section (first pass from section.nextFrom, later passes from startMs).
  cycle(section) {
    const live = () => this.section === section;   // false once another section or a pause has replaced this one
    const { uri, startMs } = section;
    return this.serial(async () => {
      if (!live()) return;
      const from = section.nextFrom; section.nextFrom = startMs;
      this.pending = section;
      try {
        const dev = await this.targetDevice();
        if (!live()) return;
        if (!dev) { const e = new Error('no device'); e.noDevice = true; this.asleep(); throw e; }
        try {
          await this.api('/me/player/play?device_id=' + encodeURIComponent(dev.id), { method: 'PUT', body: JSON.stringify({ uris: [uri], position_ms: Math.max(0, Math.round(from)) }) });
        } catch (e) {
          if (e.status === 404) { e.noDevice = true; this.asleep(); }
          throw e;
        }
        this.device = dev; this.rememberDevice(dev); this.status = 'ready'; this.error = null;
        if (!live()) return;
        section.nudged = false; section.seenPlaying = false; section.playedAt = Date.now();
        this.runClock(section, from);
        this.startMonitor(1500);   // check soon that it really started
      } finally { if (this.pending === section) this.pending = null; }
    });
  }

  // Spotify is (probably) already playing this song, e.g. the user just pressed play in the Spotify app after we
  // woke it. Follow that playback without sending a command, so the music does not jump: adopt it when it is
  // inside the section or within `leadMs` before it (the loop then starts at the section end as usual).
  // Returns false when Spotify is not playing this song, or is too far from the section; the caller then plays.
  async adopt(uri, startMs, endMs, { onProgress, leadMs = 20000 } = {}) {
    if (!this.ready || this.player) return false;
    const st = await this.state();
    if (!st?.is_playing || st.item?.uri !== uri) return false;
    const pos = st.progress_ms || 0;
    if (pos < startMs - leadMs || pos >= endMs - 1000) return false;
    const section = this.newSection(uri, startMs, endMs, { loop: true, onProgress });
    section.seenPlaying = true; section.playedAt = Date.now();
    if (st.device?.id) { this.device = { id: st.device.id, name: st.device.name }; this.rememberDevice(this.device); }
    this.note(`player: following Spotify at ${Math.round(pos / 1000)}s (section ${Math.round(startMs / 1000)}–${Math.round(endMs / 1000)}s)`);
    this.status = 'ready'; this.error = null;
    this.runClock(section, pos);
    this.startMonitor();
    return true;
  }

  // Local clock for the progress bar; at the section end, issue the next play command (once).
  runClock(section, from) {
    const { endMs, loop, onProgress } = section;
    this.stopLoop();
    const t0 = Date.now();
    section.clock = { from, t0 };
    this.loop = setInterval(() => {
      const c = section.clock; const pos = c.from + (Date.now() - c.t0);
      onProgress && onProgress(pos, section);
      if (pos >= endMs) {
        this.stopLoop();   // stop ticking first: one restart per section end, not one per tick while it is in flight
        if (loop) section.restart(); else this.pause();
      }
    }, 250);
  }

  // Current playback as Spotify reports it, or null when nothing is active.
  async state() {
    try { return await this.api('/me/player'); } catch { return null; }
  }

  startMonitor(firstMs = 3000) {
    this.stopMonitor();
    const tick = () => { this.tick().catch(() => {}); };
    this.monitorTimer = setTimeout(() => { tick(); this.monitorTimer = setInterval(tick, 3000); }, firstMs);
  }
  stopMonitor() { if (this.monitorTimer) { clearTimeout(this.monitorTimer); clearInterval(this.monitorTimer); this.monitorTimer = null; } }

  async tick() {
    const sec = this.section;
    if (!sec || this.player || this.pending || document.hidden || this.ticking) return;
    this.ticking = true;
    try {
      const st = await this.state();
      if (this.section !== sec || this.pending) return;
      const ours = st?.item?.uri === sec.uri;
      if (st?.is_playing && ours) {
        const pos = st.progress_ms || 0;
        sec.seenPlaying = true;
        if (pos >= sec.endMs || pos < sec.startMs - 2000) {      // playing our song but outside the section
          if (!this.loop) { this.note('player: outside section, restarting'); sec.restart(); }
        } else if (!this.loop) {                                 // started from the Spotify app: follow it
          this.note(`player: playing at ${Math.round(pos / 1000)}s, following`);
          this.runClock(sec, pos); this.onPlaying(true);
        } else if (sec.clock) {                                  // keep the bar on Spotify's clock
          sec.clock = { from: pos, t0: Date.now() };
        }
        return;
      }
      if (ours && !sec.nudged && !sec.seenPlaying && Date.now() - sec.playedAt < 15000) {
        // Our play command loaded the track but it never started (a backgrounded phone does this): one plain
        // resume. A pause after it has been heard playing is the user's, and the play button just follows it.
        sec.nudged = true;
        this.note('player: loaded but paused, resuming');
        const dev = this.device;
        await this.serial(() => dev ? this.api('/me/player/play?device_id=' + encodeURIComponent(dev.id), { method: 'PUT' }).catch(() => {}) : null);
        return;
      }
      if (this.loop) { this.note(`player: ${st ? (ours ? 'paused' : 'playing something else') : 'nothing active'}`); this.stopLoop(); }
      this.onPlaying(false);
    } finally { this.ticking = false; }
  }

  // In-page player: start the track here, then follow the SDK's own clock and seek back at the section end.
  async playSectionSdk(section, fromMs) {
    const { uri, startMs, endMs, loop, onProgress } = section;
    const firstMs = Math.min(endMs - 200, Math.max(startMs, fromMs ?? startMs));
    await this.player.activateElement?.();
    await this.serial(() => this.api(`/me/player/play?device_id=${this.sdkId}`, { method: 'PUT', body: JSON.stringify({ uris: [uri], position_ms: Math.max(0, Math.round(firstMs)) }) }));
    if (this.section !== section) return;
    this.loop = setInterval(async () => {
      const st = await this.player.getCurrentState();
      if (!st || st.paused) return;
      onProgress && onProgress(st.position, section);
      if (st.position >= endMs - 150) {
        if (loop) await this.player.seek(startMs); else { await this.player.pause(); this.stopLoop(); }
      }
    }, 250);
  }

  stopLoop() { if (this.loop) { clearInterval(this.loop); this.loop = null; } }

  async pause() {
    this.stopLoop(); this.stopMonitor();
    const had = this.section; this.section = null;
    if (!had) return;                     // nothing of ours is playing
    if (this.player) { try { await this.player.pause(); } catch { /* not playing */ } return; }
    return this.serial(async () => {
      const dev = this.device; if (!dev) return;
      try { await this.api('/me/player/pause?device_id=' + encodeURIComponent(dev.id), { method: 'PUT' }); } catch { /* already paused or gone */ }
    });
  }
  async resume() { if (this.section) return this.playSection(this.section.uri, this.section.startMs, this.section.endMs, this.section); }
  async restart() { return this.resume(); }
  async isPaused() { return !this.loop; }

  async track(id) { return this.api(`/tracks/${id}`); }
}
