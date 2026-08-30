/* Both `v1/user/bookmark/*` collections behind one interface, so the profile lists
   and the detail-screen hearts share a cache entry. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addDelegateFavo,
  addLegisInitFavo,
  getFavoDelegates,
  getFavoLegisInits,
  removeDelegateFavo,
  removeLegisInitFavo,
  updateDelegateFavo,
} from '@/api/authed';
import { isHasError, unwrap } from '@/api/client';
import { useAuth } from '@/lib/use-auth';
import type { DelegateFavo, HasError, LegisInitFavo } from '@/types';

export type FavoriteKind = 'delegate' | 'vote';

/** somes-frontend sends no interval; its "Infoabstand" select starts at 7. */
export const DEFAULT_INFO_DAYS = 7;

export const DELEGATE_FAVO_KEY = ['favo-delegates'] as const;
export const VOTE_FAVO_KEY = ['favo-legis-inits'] as const;

/** Mutations must reject so react-query rolls back; the reads use `unwrap`. */
function assertOk(result: unknown | HasError): void {
  if (isHasError(result)) throw new Error(`${result.error_type}: ${result.error}`);
}

export function useFavoriteDelegates() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: DELEGATE_FAVO_KEY,
    queryFn: async () => unwrap(await getFavoDelegates()),
    enabled: isAuthenticated,
  });
}

export function useFavoriteVotes() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: VOTE_FAVO_KEY,
    queryFn: async () => unwrap(await getFavoLegisInits()),
    enabled: isAuthenticated,
  });
}

/** `isReady` is false while loading, so the heart stays inert rather than flashing. */
export function useFavorite(kind: FavoriteKind, id: number | null) {
  const queryClient = useQueryClient();
  const delegates = useFavoriteDelegates();
  const votes = useFavoriteVotes();

  const list = kind === 'delegate' ? delegates : votes;
  const queryKey = kind === 'delegate' ? DELEGATE_FAVO_KEY : VOTE_FAVO_KEY;

  const isFavorite =
    id !== null &&
    (kind === 'delegate'
      ? (delegates.data ?? []).some((favo) => favo.delegate_id === id)
      : (votes.data ?? []).some((favo) => favo.vote_result_id === id));

  const mutation = useMutation({
    mutationFn: async () => {
      if (id === null) return;
      if (kind === 'delegate') {
        // `user_info_days` is required by serde on both calls, even to remove.
        const body: DelegateFavo = { delegate_id: id, user_info_days: DEFAULT_INFO_DAYS };
        assertOk(isFavorite ? await removeDelegateFavo(body) : await addDelegateFavo(body));
      } else {
        const body: LegisInitFavo = { vote_result_id: id };
        assertOk(isFavorite ? await removeLegisInitFavo(body) : await addLegisInitFavo(body));
      }
    },
    onMutate: async () => {
      if (id === null) return {};
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      if (kind === 'delegate') {
        queryClient.setQueryData<DelegateFavo[]>(DELEGATE_FAVO_KEY, (current = []) =>
          isFavorite
            ? current.filter((favo) => favo.delegate_id !== id)
            : [...current, { delegate_id: id, user_info_days: DEFAULT_INFO_DAYS }]
        );
      } else {
        queryClient.setQueryData<LegisInitFavo[]>(VOTE_FAVO_KEY, (current = []) =>
          isFavorite
            ? current.filter((favo) => favo.vote_result_id !== id)
            : [...current, { vote_result_id: id }]
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    isFavorite,
    isReady: list.isSuccess,
    isPending: mutation.isPending,
    toggle: () => mutation.mutate(),
  };
}

/** The "Infoabstand" select on a favourited member. */
export function useUpdateFavoriteInterval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favo: DelegateFavo) => assertOk(await updateDelegateFavo(favo)),
    onMutate: async (favo) => {
      await queryClient.cancelQueries({ queryKey: DELEGATE_FAVO_KEY });
      const previous = queryClient.getQueryData<DelegateFavo[]>(DELEGATE_FAVO_KEY);
      queryClient.setQueryData<DelegateFavo[]>(DELEGATE_FAVO_KEY, (current = []) =>
        current.map((entry) => (entry.delegate_id === favo.delegate_id ? favo : entry))
      );
      return { previous };
    },
    onError: (_error, _favo, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(DELEGATE_FAVO_KEY, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: DELEGATE_FAVO_KEY }),
  });
}
