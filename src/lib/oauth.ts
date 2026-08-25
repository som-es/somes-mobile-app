/**
 * Google sign-in.
 *
 * somes-api runs the whole OAuth exchange itself and hands back a finished JWT
 * by redirecting; the client never sees a provider token or a client secret.
 * On the web that redirect lands on `somes.at/resolve_token`, which *is* the web
 * app, so it can read the token out of its own URL. A native app has no such
 * luck — the browser that finishes the flow is a separate process — so it asks
 * the server to redirect to the app's own URL scheme instead.
 *
 * `is_mobile=true` is that opt-in, and it is a flag rather than a URL on
 * purpose: the redirect carries a live JWT, so the server picks the target from
 * its own allowlist rather than trusting the caller.
 *
 * A system browser is required, not a WebView: Google rejects OAuth from
 * embedded WebViews with `disallowed_useragent`. `openAuthSessionAsync` uses
 * ASWebAuthenticationSession on iOS and Custom Tabs on Android.
 */
import * as WebBrowser from 'expo-web-browser';

import { address } from '@/api/client';

/**
 * Where somes-api sends the token back to: its `OAUTH_REDIRECT_URI_MOBILE`,
 * which defaults to `somesmobileapp://resolve_token?token=`.
 *
 * Only the **scheme** has to line up. ASWebAuthenticationSession and Custom Tabs
 * both match on that alone, and the path is only used by the `resolve_token`
 * fallback route — so any `somesmobileapp://…?token=…` the backend picks works.
 */
export const OAUTH_RETURN_URL = 'somesmobileapp://resolve_token';

/** OAuth is mounted at the API root — no `at/` country segment, no `v1/`. */
const startUrl = (provider: string) =>
  `${address}/api/oauth/${provider}?is_mobile=true`;

export type OAuthResult =
  | { status: 'success'; accessToken: string }
  | { status: 'cancelled' }
  | { status: 'error' };

export async function signInWithProvider(provider: 'google'): Promise<OAuthResult> {
  let result;
  try {
    result = await WebBrowser.openAuthSessionAsync(startUrl(provider), OAUTH_RETURN_URL);
  } catch (error) {
    console.warn(`OAuth session failed: ${error}`);
    return { status: 'error' };
  }

  // `dismiss` is the user swiping the sheet away, `cancel` the explicit button.
  if (result.type !== 'success') return { status: 'cancelled' };

  const accessToken = tokenFromUrl(result.url);
  return accessToken ? { status: 'success', accessToken } : { status: 'error' };
}

/**
 * Pull the JWT out of `somesmobileapp://resolve_token?token=…`.
 *
 * Read by hand rather than with `Linking.parse` or `URL`: the server appends the
 * token to the redirect without encoding it, so what comes back is only
 * well-formed by virtue of a JWT being base64url — no `%`, `+` or `&` to
 * misparse. A regex makes no assumptions about how a URL parser treats a custom
 * scheme, and unlike either alternative it can be tested outside the app.
 */
export function tokenFromUrl(url: string): string | null {
  const match = /[?&]token=([^&#]+)/.exec(url);
  return match ? match[1] : null;
}
