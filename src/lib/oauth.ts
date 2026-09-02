/* google sign in, somes-api runs the whole exchange and redirects back with a
   finished jwt, is_mobile opts into the app url scheme, it is a flag and not a url
   because the redirect carries a live token so the server picks the target itself,
   a system browser is required since google rejects embedded webviews */
import { extractTokenFromRedirectUrl } from '@som-es/somes-ts';
import * as WebBrowser from 'expo-web-browser';

import { somes } from '@/lib/somes';

/** where somes-api sends the token back to, only the scheme has to match */
export const OAUTH_RETURN_URL = 'somesmobileapp://resolve_token';

/** the library appends is_mobile, that flag is what makes the server redirect
    to the app scheme rather than to the website */
const startUrl = (provider: string) => somes.oauthUrl(provider, { isMobile: true });

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

  const accessToken = extractTokenFromRedirectUrl(result.url);
  return accessToken ? { status: 'success', accessToken } : { status: 'error' };
}
