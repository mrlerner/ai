// config.js — public app configuration. The Spotify client ID is a public identifier (PKCE, no secret).
// The redirect URI must be registered in the Spotify developer dashboard for this app:
//   local dev:  http://127.0.0.1:8888/callback
//   published:  <page url> (e.g. https://mrlerner.github.io/ai/changes/)
export const CONFIG = {
  spotifyClientId: 'c094c8ccf85c4a8b95cdde2cbef5a7b9',
  redirectUri: (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
    ? `${location.protocol}//${location.host}/callback`
    : location.origin + location.pathname.replace(/index\.html$/, ''),
  sessionMinutes: 5,
  appName: 'Changes',
};
