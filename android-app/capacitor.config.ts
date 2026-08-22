import type { CapacitorConfig } from '@capacitor/cli';

// This app is a thin native wrapper: it doesn't ship its own web assets
// (www/ is just a fallback loading screen) — instead it points the
// WebView straight at the live site, so the app always shows whatever is
// currently deployed on aapkokyalagtahai.com with zero extra release
// steps on the web side. The tradeoff: no offline support, and the app
// needs network on first launch. That's the right tradeoff for a fast
// MVP wrapper; revisit if offline support becomes a priority.
const config: CapacitorConfig = {
  appId: 'com.aapkokyalagtahai.app',
  appName: 'Aapko Kya Lagta Hai',
  webDir: 'www',
  server: {
    // Loads the real production site directly.
    url: 'https://aapkokyalagtahai.com',
    androidScheme: 'https',
    // Lets the WebView navigate within the app's own domain (including the
    // www subdomain) without triggering Capacitor's "external URL" warning.
    // Anything outside this list — Amazon affiliate links, WhatsApp share
    // links, etc — is handled by MainActivity's shouldOverrideUrlLoading
    // override, which sends it to the system browser/app instead of the
    // in-app WebView (see android/app/src/main/java/.../MainActivity.java).
    allowNavigation: ['aapkokyalagtahai.com', '*.aapkokyalagtahai.com'],
  },
  android: {
    // Matches the site's dark-mode background so the transition from
    // splash screen to the loaded page doesn't flash white.
    backgroundColor: '#0d0d0d',
  },
};

export default config;
