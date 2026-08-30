/* google sign in, somes-api runs the whole exchange and redirects back with a
   finished jwt, is_mobile opts into the app url scheme, it is a flag and not a url
   because the redirect carries a live token so the server picks the target itself,
   a system browser is required since google rejects embedded webviews */
import * as WebBrowser from 'expo-web-browser';

import { address } from '@/api/client';

/** where somes-api sends the token back to, only the scheme has to match */
export const OAUTH_RETURN_URL = 'somesmobileapp://resolve_token';

/** oauth sits at the api root, no country segment and no version */
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

  // dismiss is the user swiping the sheet away, cancel the explicit button
  if (result.type !== 'success') return { status: 'cancelled' };

  const accessToken = tokenFromUrl(result.url);
  return accessToken ? { status: 'success', accessToken } : { status: 'error' };
}

/** read by hand rather than with url, the server appends the token unencoded and a
    jwt is base64url so there is nothing to misparse */
export function tokenFromUrl(url: string): string | null {
  const match = /[?&]token=([^&#]+)/.exec(url);
  return match ? match[1] : null;
}
