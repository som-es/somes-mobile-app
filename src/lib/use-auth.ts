/* React binding over `@/lib/auth-store`. */
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
    // `exp` is seconds. A past token is refused by the server anyway, so treat it as signed out.
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

/** Sign-in/out touch the query cache, so they live here — the token store must stay
    free of React imports for the API layer's synchronous `getToken()`. */
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
    // Clear everything, so the next account never sees this one's favourites flash in.
    queryClient.clear();
  }, [queryClient]);

  return { signIn, signOut };
}

/** Only `is_email_hashed` is worth fetching; the id and e-mail are already in the token. */
export function useExtendedUser() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => unwrap(await getUser()),
    enabled: isAuthenticated,
  });
}
