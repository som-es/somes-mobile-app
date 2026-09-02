/* react binding over the library's token store */
import { getUserFromJwt } from '@som-es/somes-ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { clearToken, getToken, setToken, somes, subscribeToToken } from '@/lib/somes';
import type { BasicUserInfo } from '@/types';

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
    // exp is in seconds, a past token is refused by the server anyway so treat it as signed out
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

/** sign in and out both touch the query cache, so they live here, the token store
    itself stays free of react so the api layer can read it synchronously */
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
    // clear everything, so the next account never sees this one favourites flash in
    queryClient.clear();
  }, [queryClient]);

  return { signIn, signOut };
}

/** only is_email_hashed is worth fetching, the id and e-mail are already in the token */
export function useExtendedUser() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['user'],
    queryFn: () => somes.account.me(),
    enabled: isAuthenticated,
  });
}
