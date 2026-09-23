import { useInfiniteQuery } from '@tanstack/react-query';

import type { DelegateFilters } from '@/lib/filter-query';
import { somes } from '@/lib/somes';

/** the web asks for 50 at a time, a phone shows far fewer per screen */
export const ENTRIES_PER_PAGE = 25;

/** shared between the MP list tab and the ask-a-question picker, so both show the
    same MPs for the same filters and share a cache entry when they match */
export function useDelegates(filters: DelegateFilters, search: string) {
  return useInfiniteQuery({
    queryKey: ['delegates', filters, search],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      somes.delegates.search({
        page: pageParam,
        entriesPerPage: ENTRIES_PER_PAGE,
        name: search || null,
        legisPeriods: filters.gp ? [filters.gp] : [],
        parties: filters.parties,
        onlyGovernment: filters.onlyGov,
        includePreviousPartyMembership: filters.mindPreviousPartyMembership,
        hasActiveMandate: filters.hasActiveMandate,
      }),
    getNextPageParam: (last, pages) =>
      pages.length < last.max_page ? pages.length + 1 : undefined,
  });
}
