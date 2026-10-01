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
    this.device = null;      // the device the last play command went to
    this.chain = Promise.resolve();   // play/pause commands run one at a time, in order
    this.log = [];                    // last Spotify calls, for the diagnostics panel
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

  logout() { this.token = null; this.stopLoop(); this.ready = false; this.status = 'idle'; this.onStatus(); }

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
      `premium: ${this.premium}`, `last device: ${last ? last.name : 'none'}`, `devices now:\n  ${devs}`, '', 'recent calls:', ...this.log,
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
      this.ready = true; this.status = 'ready'; this.error = null; this.onStatus();
      return true;
    } catch (e) {
      this.status = 'error'; this.error = 'Could not reach Spotify.'; this.onStatus();
      return false;
    }
  }

  get lastDevice() { try { return JSON.parse(localStorage.getItem('ct.spotify.last') || 'null'); } catch { return null; } }
  rememberDevice(d) { if (d?.id) { try { localStorage.setItem('ct.spotify.last', JSON.stringify({ id: d.id, name: d.name })); } catch { /* ignore */ } } }

  // The device to send a command to: Spotify's own active device (the user's choice in the Spotify app). If
  // Spotify has gone idle and has no active device, the one it last played on. Never anything else.
  async targetDevice() {
    let devs = []; try { devs = (await this.api('/me/player/devices'))?.devices || []; } catch { /* none */ }
    const last = this.lastDevice;
    return devs.find(d => d.is_active) || (last && (devs.find(d => d.id === last.id) || devs.find(d => d.name === last.name))) || null;
  }

  asleep() {
    this.status = 'error';
    this.error = 'Spotify is asleep. Open Spotify and press play on anything, then come back.';
    this.onStatus();
  }

  // Play a track section [startMs, endMs) and loop it until stop(). fromMs starts the first pass partway in (a seek).
  // One play command per loop cycle and a local clock for the progress bar: no polling, so it stays far under
  // Spotify's request limits.
  // Run fn after every earlier play/pause has finished, so a pause for the old song can never land after the
  // play for the new one (that is what made Skip stop playback).
  serial(fn) { const run = this.chain.then(fn, fn); this.chain = run.catch(() => {}); return run; }

  async playSection(uri, startMs, endMs, { loop = true, onProgress, fromMs } = {}) {
    if (!this.ready) throw new Error('player not ready');
    this.stopLoop();
    const section = { uri, startMs, endMs, loop, onProgress };
    this.section = section;
    const live = () => this.section === section;   // false once another section or a pause has replaced this one
    let nextFrom = Math.min(endMs - 200, Math.max(startMs, fromMs ?? startMs));
    const cycle = () => this.serial(async () => {
      if (!live()) return;
      const from = nextFrom; nextFrom = startMs;
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
      const t0 = Date.now();
      this.stopLoop();
      this.loop = setInterval(() => {
        const pos = from + (Date.now() - t0);
        onProgress && onProgress(pos, section);
        if (pos >= endMs) {
          if (loop) { cycle().catch(() => this.stopLoop()); }
          else { this.stopLoop(); this.pause(); }
        }
      }, 250);
    });
    await cycle();
  }

  stopLoop() { if (this.loop) { clearInterval(this.loop); this.loop = null; } }

  async pause() {
    this.stopLoop();
    const had = this.section; this.section = null;
    if (!had) return;                     // nothing of ours is playing
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
