/* Google sign-in. somes-api runs the whole exchange and redirects back with a finished JWT.
   `is_mobile=true` opts into the app's URL scheme; it is a flag, not a URL, because the
   redirect carries a live JWT and the server picks the target from its own allowlist.
   A system browser is required — Google rejects embedded WebViews. */
import * as WebBrowser from 'expo-web-browser';

import { address } from '@/api/client';

/** somes-api's `OAUTH_REDIRECT_URI_MOBILE`. Only the scheme has to match. */
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

/** Read by hand rather than with `URL`: the server appends the token unencoded, and a JWT
    is base64url so there is nothing to misparse. */
export function tokenFromUrl(url: string): string | null {
  const match = /[?&]token=([^&#]+)/.exec(url);
  return match ? match[1] : null;
}
