// audio.js — a small Web Audio "band": electric piano chords, bass, light drums.
// Used to establish the key, to replay a progression with the bass isolated,
// and to A/B a guess against the truth. Everything is scheduled on the audio clock.

import { chordInfo, voiceChord, midiToFreq } from './theory.js';

export class Band {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.timer = null;
    this.playing = null; // current playback handle
  }

  // iOS: Web Audio is silenced by the ring/silent switch unless the page also plays an HTML media element,
  // and the context only resumes inside a user gesture. Both are handled here; call ensure() from a tap.
  unlockIOS() {
    if (this.unlocked) return;
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!ios) { this.unlocked = true; return; }
    try {
      if (!this.silent) {
        // 1-second silent WAV, looped: keeps the audio session in "playback" so the ringer switch is ignored
        const rate = 8000, n = rate, header = new ArrayBuffer(44 + n), v = new DataView(header);
        const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
        w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
        v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
        w(36, 'data'); v.setUint32(40, n, true); for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
        const a = document.createElement('audio');
        a.src = URL.createObjectURL(new Blob([header], { type: 'audio/wav' }));
        a.loop = true; a.volume = 0.01; a.setAttribute('playsinline', ''); a.style.display = 'none';
        document.body.appendChild(a);
        this.silent = a;
      }
      const p = this.silent.play(); if (p && p.catch) p.catch(() => {});
      // a one-sample buffer started inside the gesture unlocks the context on older iOS
      if (this.ctx) { const b = this.ctx.createBuffer(1, 1, 22050); const src = this.ctx.createBufferSource(); src.buffer = b; src.connect(this.ctx.destination); src.start(0); }
      this.unlocked = true;
    } catch (e) { /* best effort */ }
  }

  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
      this.master.connect(comp).connect(this.ctx.destination);
      this.noise = this._noiseBuffer();
    }
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') this.ctx.resume();
    this.unlockIOS();
    return this.ctx;
  }

  _noiseBuffer() {
    const len = this.ctx.sampleRate * 1.0;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---- instruments ---------------------------------------------------------

  epiano(midi, t, dur, vel = 0.5) {
    const ctx = this.ctx;
    const f = midiToFreq(midi);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.008);
    out.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    // FM pair: carrier sine, modulator at 1:1 with a fast-decaying index — Rhodes-ish bell tone
    const car = ctx.createOscillator(); car.type = 'sine'; car.frequency.value = f;
    const mod = ctx.createOscillator(); mod.type = 'sine'; mod.frequency.value = f;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(f * 1.4, t);
    modGain.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.5);
    mod.connect(modGain).connect(car.frequency);
    // a soft second partial an octave up for air
    const oct = ctx.createOscillator(); oct.type = 'triangle'; oct.frequency.value = f * 2;
    const octGain = ctx.createGain(); octGain.gain.value = 0.06;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.Q.value = 0.5;
    car.connect(lp); oct.connect(octGain).connect(lp); lp.connect(out).connect(this.master);
    car.start(t); mod.start(t); oct.start(t);
    car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05); oct.stop(t + dur + 0.05);
  }

  bass(midi, t, dur, vel = 0.7) {
    const ctx = this.ctx;
    const f = midiToFreq(midi);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.012);
    out.gain.setValueAtTime(vel, t + Math.max(0.05, dur - 0.08));
    out.gain.exponentialRampToValueAtTime(0.001, t + dur);
    const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f;
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(220, t + 0.25);
    o1.connect(lp); o2.connect(g2).connect(lp); lp.connect(out).connect(this.master);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  kick(t, vel = 0.9) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.4);
  }

  snare(t, vel = 0.35) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    src.connect(bp).connect(g).connect(this.master); src.start(t); src.stop(t + 0.2);
    const o = ctx.createOscillator(); o.frequency.value = 190;
    const g2 = ctx.createGain(); g2.gain.setValueAtTime(vel * 0.6, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g2).connect(this.master); o.start(t); o.stop(t + 0.12);
  }

  hat(t, vel = 0.12, open = false) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource(); src.buffer = this.noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain();
    const d = open ? 0.25 : 0.05;
    g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    src.connect(hp).connect(g).connect(this.master); src.start(t); src.stop(t + d + 0.02);
  }

  // ---- arrangement ---------------------------------------------------------

  /**
   * Play a progression.
   * chords: [{rn, bass?, beats}], key: parsed key, opts:
   *   tempo (bpm), loops (int), chords (bool), bass (bool), drums (bool),
   *   rootPosition (bool: ignore slash-chord bass), onChord(index, chordInfo), onEnd()
   */
  play(chords, key, opts = {}) {
    this.stop();
    const ctx = this.ensure();
    const tempo = Math.min(150, Math.max(60, opts.tempo || 100));
    const beat = 60 / tempo;
    const loops = opts.loops ?? 1;
    const useChords = opts.chords ?? true;
    const useBass = opts.bass ?? true;
    const useDrums = opts.drums ?? true;
    const infos = chords.map(c => chordInfo(c, key));
    const t0 = ctx.currentTime + 0.12;
    const handle = { stopped: false, timeouts: [] };
    this.playing = handle;

    let t = t0;
    for (let L = 0; L < loops; L++) {
      chords.forEach((c, i) => {
        const info = infos[i];
        const beats = c.beats || 4;
        const dur = beats * beat;
        const v = voiceChord(info, { rootPosition: !!opts.rootPosition });
        const tStart = t;
        // fire the highlight callback on the audio clock
        if (opts.onChord) {
          const delay = Math.max(0, (tStart - ctx.currentTime) * 1000);
          handle.timeouts.push(setTimeout(() => { if (!handle.stopped) opts.onChord(i, info, L); }, delay));
        }
        if (useChords) {
          // hit on beat 1, a softer re-hit halfway through (beat 3 of a 4-beat chord)
          const hits = beats >= 4 && beats % 3 !== 0 ? [0, beats / 2] : beats === 6 ? [0, 3] : [0];
          hits.forEach((h, hi) => {
            v.chordMidis.forEach((m, k) => this.epiano(m, tStart + h * beat + k * 0.012, (beats - h) * beat * 0.95, hi === 0 ? 0.32 : 0.2));
          });
        }
        if (useBass) {
          // root on 1, again on 3 with a passing octave pickup on the "and" of 4
          this.bass(v.bassMidi, tStart, Math.min(dur, 2 * beat) * 0.95, 0.75);
          if (beats >= 4) {
            this.bass(v.bassMidi, tStart + 2 * beat, 1.5 * beat, 0.6);
            this.bass(v.bassMidi + 12, tStart + 3.5 * beat, 0.45 * beat, 0.35);
          }
          if (beats >= 8) {
            this.bass(v.bassMidi, tStart + 4 * beat, 2 * beat * 0.95, 0.7);
            this.bass(v.bassMidi, tStart + 6 * beat, 1.5 * beat, 0.6);
            this.bass(v.bassMidi + 12, tStart + 7.5 * beat, 0.45 * beat, 0.35);
          }
        }
        if (useDrums) {
          const triple = beats % 3 === 0 && beats % 4 !== 0; // 3/4 or 6/8 feel
          for (let b = 0; b < beats; b++) {
            const tb = tStart + b * beat;
            if (triple) {
              if (b % 3 === 0) this.kick(tb, 0.65);
              else this.hat(tb, 0.10);
              if (b % 6 === 3) this.snare(tb, 0.16);
            } else {
              if (b % 4 === 0) this.kick(tb, 0.7);
              if (b % 4 === 2) this.kick(tb, 0.5);
              if (b % 2 === 1) this.snare(tb, 0.22);
              this.hat(tb, 0.10); this.hat(tb + beat / 2, 0.06);
            }
          }
        }
        t += dur;
      });
    }
    const endDelay = Math.max(0, (t - ctx.currentTime) * 1000) + 150;
    handle.timeouts.push(setTimeout(() => { if (!handle.stopped) { handle.stopped = true; this.playing = null; opts.onEnd && opts.onEnd(); } }, endDelay));
    handle.stop = () => this.stop();
    handle.duration = t - t0;
    return handle;
  }

  // Establish the key: tonic chord, then I–IV–V–I (or i–iv–V–i), then tonic held.
  playKey(key, opts = {}) {
    const maj = key.mode === 'major';
    const cad = maj
      ? [{ rn: 'I', beats: 2 }, { rn: 'IV', beats: 1 }, { rn: 'V', beats: 1 }, { rn: 'I', beats: 4 }]
      : [{ rn: 'i', beats: 2 }, { rn: 'iv', beats: 1 }, { rn: 'V', beats: 1 }, { rn: 'i', beats: 4 }];
    return this.play(cad, key, { tempo: 96, drums: false, bass: true, chords: true, ...opts });
  }

  stop() {
    if (this.playing) {
      this.playing.stopped = true;
      this.playing.timeouts.forEach(clearTimeout);
      this.playing = null;
    }
    if (this.ctx) {
      // hard-stop everything by ducking the master briefly and rebuilding the chain
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(0, now + 0.03);
      const old = this.master;
      const g = this.ctx.createGain(); g.gain.value = 0.8;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.2;
      g.connect(comp).connect(this.ctx.destination);
      this.master = g;
      setTimeout(() => { try { old.disconnect(); } catch (e) { /* already gone */ } }, 80);
    }
  }
}
