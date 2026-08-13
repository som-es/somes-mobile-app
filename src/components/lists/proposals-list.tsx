import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { departments_per_gp, gov_proposals_by_search } from '@/api/api';
import { unwrap } from '@/api/client';
import { ProposalCard } from '@/components/cards/proposal-card';
import { ProposalGenericSheet } from '@/components/filters/generic-sheet';
import { MultiSelectSheet } from '@/components/filters/multi-select-sheet';
import { ResultList } from '@/components/lists/result-list';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { isoToDotDate } from '@/lib/date';
import { emptyProposalFilters, govProposalsQuery, proposalFilterCounts } from '@/lib/filter-query';
import { useDebounced } from '@/lib/use-debounced';
import { spacing } from '@/theme/layout';

import { useFilterSources, withCount, type Sheet } from './filter-sources';

type Props = {
  control: ReactNode;
};

export function ProposalsList({ control }: Props) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(emptyProposalFilters);
  const [sheet, setSheet] = useState<Sheet>(null);

  const debouncedSearch = useDebounced(search);
  const query = govProposalsQuery(filters, debouncedSearch, 1);

  const results = useInfiniteQuery({
    queryKey: ['gov-proposals', query],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      unwrap(await gov_proposals_by_search(govProposalsQuery(filters, debouncedSearch, pageParam))),
    getNextPageParam: (last, pages) => (pages.length < last.max_page ? pages.length + 1 : undefined),
  });

  const { topics, periods } = useFilterSources();

  const ministries = useQuery({
    queryKey: ['departments-per-gp'],
    queryFn: async () => unwrap(await departments_per_gp()),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const counts = proposalFilterCounts(filters);
  const items = results.data?.pages.flatMap((page) => page.gov_proposals) ?? [];
  const updatedAt = results.data?.pages[0]?.updated_at;

  const header = (
    <>
      {control}

      <ScreenTitle
        title="Ministerialentwürfe"
        subtitle={updatedAt ? `Aktualisiert am ${isoToDotDate(updatedAt)}` : undefined}
        centered
      />

      <SearchField value={search} onChangeText={setSearch} />

      <View style={styles.filters}>
        <View style={styles.slot}>
          <FilterPill label={withCount('Themen', counts.topics)} onPress={() => setSheet('topics')} />
        </View>
        <View style={styles.slot}>
          <FilterPill
            label={withCount('Ministerien', counts.ministries)}
            onPress={() => setSheet('second')}
          />
        </View>
        <View style={styles.slot}>
          <FilterPill
            label={withCount('Filter', counts.generic)}
            onPress={() => setSheet('generic')}
          />
        </View>
      </View>
    </>
  );

  return (
    <>
      <ResultList
        header={header}
        items={items}
        keyExtractor={(proposal) => String(proposal.gov_proposal.ministrial_proposal.id)}
        renderItem={(proposal) => <ProposalCard proposal={proposal} />}
        isPending={results.isPending}
        isError={results.isError}
        errorMessage="Ministerialentwürfe konnten nicht geladen werden."
        emptyMessage="Keine Ministerialentwürfe gefunden"
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) results.fetchNextPage();
        }}
        isFetchingNextPage={results.isFetchingNextPage}
        refreshing={results.isRefetching && !results.isFetchingNextPage}
        onRefresh={() => results.refetch()}
      />

      <MultiSelectSheet
        visible={sheet === 'topics'}
        title="Themen"
        values={topics}
        selected={filters.topics}
        onChange={(selected) => setFilters({ ...filters, topics: selected })}
        onClose={() => setSheet(null)}
        searchable
        searchPlaceholder="Thema suchen..."
      />

      <MultiSelectSheet
        visible={sheet === 'second'}
        title="Ministerien"
        values={ministriesFor(ministries.data, filters.gp)}
        selected={filters.departments}
        onChange={(departments) => setFilters({ ...filters, departments })}
        onClose={() => setSheet(null)}
        searchable
        searchPlaceholder="Ministerium suchen..."
      />

      <ProposalGenericSheet
        visible={sheet === 'generic'}
        periods={periods}
        filters={filters}
        onChange={setFilters}
        onClose={() => setSheet(null)}
      />
    </>
  );
}

/**
 * The ministries of the selected period. With "Alle" selected it walks the
 * periods newest-first and dedupes, exactly as the web's `departments` does —
 * ministries get renamed every reshuffle, so the list would otherwise repeat.
 */
function ministriesFor(
  departmentsPerGp: Record<string, string[]> | undefined,
  gp: string | null
): string[] {
  if (!departmentsPerGp) return [];
  if (gp) return departmentsPerGp[gp] ?? [];

  const seen = new Set<string>();
  Object.keys(departmentsPerGp)
    .sort()
    .reverse()
    .forEach((key) => departmentsPerGp[key].forEach((department) => seen.add(department)));
  return [...seen];
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slot: {
    flex: 1,
  },
});
