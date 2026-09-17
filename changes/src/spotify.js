// spotify.js — PKCE login (no secret) + Web Playback SDK so the page itself is a Spotify device.
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
    this.player = null;
    this.deviceId = null;
    this.deviceName = null;
    this.mode = null;        // 'sdk' (this page is the player) | 'connect' (another Spotify device, e.g. the phone app)
    this.ready = false;
    this.status = 'idle'; // idle | connecting | ready | error
    this.error = null;
    this.onStatus = () => {};
    this.loop = null;
    this.premium = null;
    this.devices = [];
  }

  // The Web Playback SDK does not run on iOS/iPadOS browsers; use Connect there.
  static sdkSupported() {
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return !ios && typeof window.MediaSource !== 'undefined';
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

  logout() { this.token = null; if (this.player) { this.player.disconnect(); this.player = null; } this.status = 'idle'; this.onStatus(); }

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

  async api(path, opts = {}) {
    const tok = await this.accessToken();
    if (!tok) throw new Error('not logged in');
    const r = await fetch(API + path, { ...opts, headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    if (r.status === 204) return null;
    const text = await r.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) { const e = new Error(data?.error?.message || ('Spotify ' + r.status)); e.status = r.status; e.data = data; throw e; }
    return data;
  }

  async me() { return this.api('/me'); }

  // ---- player ---------------------------------------------------------------

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

  async connect() {
    if (this.ready) return true;
    if (!this.loggedIn) return false;
    this.status = 'connecting'; this.onStatus();
    try {
      const me = await this.me();
      this.premium = me.product === 'premium';
      if (!this.premium) { this.status = 'error'; this.error = 'Spotify playback in the browser needs a Premium account. The synth band will play instead.'; this.onStatus(); return false; }
      if (!Spotify.sdkSupported()) return this.connectDevice();
      await this.loadSdk();
      this.player = new window.Spotify.Player({
        name: 'Chord Ear Trainer',
        getOAuthToken: cb => this.accessToken().then(cb),
        volume: 0.9,
      });
      const ready = new Promise((resolve, reject) => {
        this.player.addListener('ready', ({ device_id }) => { this.deviceId = device_id; resolve(); });
        this.player.addListener('not_ready', () => { this.ready = false; this.status = 'connecting'; this.onStatus(); });
        this.player.addListener('initialization_error', ({ message }) => reject(new Error(message)));
        this.player.addListener('authentication_error', ({ message }) => reject(new Error(message)));
        this.player.addListener('account_error', ({ message }) => reject(new Error(message)));
        this.player.addListener('playback_error', ({ message }) => { console.warn('playback_error', message); });
        this.player.addListener('player_state_changed', s => this._onState(s));
        setTimeout(() => reject(new Error('Spotify player timed out')), 15000);
      });
      const ok = await this.player.connect();
      if (!ok) throw new Error('player.connect() failed');
      await ready;
      this.ready = true; this.mode = 'sdk'; this.status = 'ready'; this.error = null; this.onStatus();
      return true;
    } catch (e) {
      // SDK failed (unsupported browser, DRM blocked, …): fall back to driving another device
      try { this.player && this.player.disconnect(); } catch { /* ignore */ }
      this.player = null;
      return this.connectDevice(e.message || String(e));
    }
  }

  // ---- Connect mode ---------------------------------------------------------
  async listDevices() {
    try { const r = await this.api('/me/player/devices'); this.devices = r?.devices || []; } catch { this.devices = []; }
    return this.devices;
  }

  async connectDevice(reason) {
    const devs = await this.listDevices();
    const preferred = localStorage.getItem('ct.spotify.device');
    const dev = devs.find(d => d.id === preferred) || devs.find(d => d.is_active) || devs.find(d => d.type === 'Smartphone') || devs[0];
    if (!dev) {
      this.status = 'error'; this.mode = 'connect'; this.ready = false;
      this.error = 'Open the Spotify app on this phone (or any device), press play once, then tap retry.';
      this.onStatus(); return false;
    }
    this.deviceId = dev.id; this.deviceName = dev.name; this.mode = 'connect';
    this.ready = true; this.status = 'ready'; this.error = null; this.onStatus();
    return true;
  }

  async useDevice(id) {
    const dev = this.devices.find(d => d.id === id); if (!dev) return false;
    try { localStorage.setItem('ct.spotify.device', id); } catch { /* ignore */ }
    this.deviceId = id; this.deviceName = dev.name; this.mode = 'connect'; this.ready = true; this.status = 'ready'; this.error = null;
    if (this.player) { try { this.player.disconnect(); } catch { /* ignore */ } this.player = null; }
    this.onStatus(); return true;
  }

  _onState(s) {
    this.state = s;
    if (this.onState) this.onState(s);
  }

  // Play a track section [startMs, endMs) and loop it until stop().
  async playSection(uri, startMs, endMs, { loop = true, onProgress } = {}) {
    if (!this.ready) throw new Error('player not ready');
    this.stopLoop();
    if (this.mode === 'connect') return this.playSectionConnect(uri, startMs, endMs, { loop, onProgress });
    await this.player.activateElement?.();
    await this.api(`/me/player/play?device_id=${this.deviceId}`, { method: 'PUT', body: JSON.stringify({ uris: [uri], position_ms: Math.max(0, Math.round(startMs)) }) });
    const section = { uri, startMs, endMs, loop, onProgress };
    this.section = section;
    this.loop = setInterval(async () => {
      const st = await this.player.getCurrentState();
      if (!st || st.paused) return;
      const pos = st.position;
      onProgress && onProgress(pos, section);
      if (pos >= endMs - 150) {
        if (loop) await this.player.seek(startMs); else { await this.player.pause(); this.stopLoop(); }
      }
    }, 250);
  }

  // Connect mode: one play command per loop cycle and a local clock for the progress bar. No polling,
  // so it stays far under Spotify's request limits (~3 calls a minute while looping).
  async playSectionConnect(uri, startMs, endMs, { loop, onProgress }) {
    const section = { uri, startMs, endMs, loop, onProgress };
    this.section = section;
    const dur = Math.max(1000, endMs - startMs);
    const cycle = async () => {
      try {
        await this.api(`/me/player/play?device_id=${this.deviceId}`, { method: 'PUT', body: JSON.stringify({ uris: [uri], position_ms: Math.max(0, Math.round(startMs)) }) });
      } catch (e) {
        if (e.status === 404) { this.ready = false; this.status = 'error'; this.error = 'That Spotify device went away. Open Spotify, then tap retry.'; this.onStatus(); }
        throw e;
      }
      const t0 = Date.now();
      this.stopLoop();
      this.loop = setInterval(async () => {
        const pos = startMs + (Date.now() - t0);
        onProgress && onProgress(pos, section);
        if (pos >= endMs) {
          if (loop) { cycle().catch(() => this.stopLoop()); }
          else { this.stopLoop(); this.api('/me/player/pause?device_id=' + this.deviceId, { method: 'PUT' }).catch(() => {}); }
        }
      }, 250);
    };
    await cycle();
  }

  stopLoop() { if (this.loop) { clearInterval(this.loop); this.loop = null; } }

  async pause() {
    this.stopLoop();
    if (this.mode === 'connect') { if (this.ready && this.section) { try { await this.api('/me/player/pause?device_id=' + this.deviceId, { method: 'PUT' }); } catch { /* not playing */ } this.section = null; } return; }
    if (this.player) { try { await this.player.pause(); } catch { /* not playing */ } }
  }
  async resume() {
    if (this.mode === 'connect') { if (this.section) return this.playSectionConnect(this.section.uri, this.section.startMs, this.section.endMs, this.section); return; }
    if (this.player) { await this.player.resume(); if (this.section && !this.loop) this.playSection(this.section.uri, this.section.startMs, this.section.endMs, this.section); }
  }
  async restart() { if (this.section) return this.playSection(this.section.uri, this.section.startMs, this.section.endMs, this.section); }
  async isPaused() { if (this.mode === 'connect') return !this.loop; const s = await this.player?.getCurrentState(); return !s || s.paused; }
  async setVolume(v) { if (this.player) await this.player.setVolume(v); }

  async track(id) { return this.api(`/tracks/${id}`); }
}
