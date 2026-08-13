import { useQuery } from '@tanstack/react-query';

import { all_gps, get_eurovoc_topics } from '@/api/api';
import { unwrap } from '@/api/client';

/** Which sheet is open. `second` is Parteien on votes, Ministerien on proposals. */
export type Sheet = 'topics' | 'second' | 'generic' | null;

/** A day: topics and legislative periods change once per period at most. */
const STALE = 1000 * 60 * 60 * 24;

/**
 * The two option sources both tabs share. Kept in one hook so switching tabs
 * reuses the cached lists instead of refetching them.
 */
export function useFilterSources() {
  const topics = useQuery({
    queryKey: ['eurovoc-topics'],
    queryFn: async () => unwrap(await get_eurovoc_topics()),
    staleTime: STALE,
  });

  const periods = useQuery({
    queryKey: ['all-gps'],
    queryFn: async () => unwrap(await all_gps()),
    staleTime: STALE,
  });

  return {
    topics: topics.data?.map((topic) => topic.topic) ?? [],
    periods: periods.data?.map((period) => period.gp) ?? [],
  };
}

/** "Themen" with nothing selected, "Themen (3)" with three — as `FilterDropdown` does. */
export function withCount(label: string, count: number): string {
  return count > 0 ? `${label} (${count})` : label;
}
