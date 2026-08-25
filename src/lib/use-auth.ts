/**
 * The React binding over `@/lib/auth-store`, which ships `subscribeToToken`
 * precisely so this can exist.
 *
 * somes-frontend has no equivalent: its `jwtStore` is a Svelte rune, so reading
 * `.value` is already reactive. `useSyncExternalStore` is the React counterpart.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { getUser } from '@/api/authed';
import { unwrap } from '@/api/client';
import { clearToken, getToken, setToken, subscribeToToken } from '@/lib/auth-store';
import type { BasicUserInfo } from '@/types';
import { getUserFromJwt } from '@/types';

/** Every query key whose contents belong to one account. */
export const USER_QUERY_KEYS = [
  ['user'],
  ['mail-send-info'],
  ['user-topics'],
  ['favo-delegates'],
  ['favo-legis-inits'],
] as const;

function decode(token: string | null): BasicUserInfo | null {
  if (token === null) return null;
  try {
    const user = getUserFromJwt(token);
    // `exp` is seconds. A token past it is refused by the server anyway, so
    // treating it as signed-out here avoids rendering a logged-in shell that
    // then fails every request. somes-frontend decodes `exp` and never reads it.
    if (typeof user?.exp !== 'number' || user.exp * 1000 <= Date.now()) return null;
    return user;
  } catch (error) {
    console.warn(`Could not decode the stored token: ${error}`);
    return null;
  }
}

export function useAuth() {
  const token = useSyncExternalStore(subscribeToToken, getToken, () => null);
  const user = useMemo(() => decode(token), [token]);

  return { token, user, isAuthenticated: user !== null };
}

/**
 * Sign-in and sign-out both have to touch the query cache, so they live here
 * rather than in the token store, which must stay free of React imports for the
 * API layer's synchronous `getToken()`.
 */
export function useSession() {
  const queryClient = useQueryClient();

  const signIn = useCallback(
    async (accessToken: string) => {
      await setToken(accessToken);
      await Promise.all(
        USER_QUERY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
      );
    },
    [queryClient]
  );

  const signOut = useCallback(async () => {
    await clearToken();
    // Not just the user keys: clearing everything stops the next account from
    // seeing this one's favourites flash in before the refetch lands.
    queryClient.clear();
  }, [queryClient]);

  return { signIn, signOut };
}

/**
 * `GET v1/user`. The only field worth fetching is `is_email_hashed` — the id and
 * e-mail are already in the token, and `is_admin` is unused here as on the web.
 */
export function useExtendedUser() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => unwrap(await getUser()),
    enabled: isAuthenticated,
  });
}
