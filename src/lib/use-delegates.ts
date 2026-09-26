import { useInfiniteQuery } from '@tanstack/react-query';

import type { DelegateFilters } from '@/lib/filter-query';
import { somes } from '@/lib/somes';

/** the web asks for 50 at a time, a phone shows far fewer per screen */
export const ENTRIES_PER_PAGE = 25;

/** the API has no sort param, so a sorted view fetches every matching delegate in
    one request and sorts it client-side instead of re-sorting each page as it
    arrives, which would shuffle already-rendered rows */
export const ALL_ENTRIES_PER_PAGE = 1000;

/** shared between the MP list tab and the ask-a-question picker, so both show the
    same MPs for the same filters and share a cache entry when they match */
export function useDelegates(filters: DelegateFilters, search: string, sorted: boolean = false) {
  return useInfiniteQuery({
    queryKey: ['delegates', filters, search, sorted],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      somes.delegates.search({
        page: pageParam,
        entriesPerPage: sorted ? ALL_ENTRIES_PER_PAGE : ENTRIES_PER_PAGE,
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
