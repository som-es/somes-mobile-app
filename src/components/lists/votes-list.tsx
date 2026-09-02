import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { VoteResultCard } from '@/components/cards/vote-result-card';
import { VoteGenericSheet } from '@/components/filters/generic-sheet';
import { MultiSelectSheet } from '@/components/filters/multi-select-sheet';
import { PartySheet } from '@/components/filters/party-sheet';
import { ResultList } from '@/components/lists/result-list';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { isoToDotDate } from '@/lib/date';
import { emptyVoteFilters, voteFilterCounts, voteResultsQuery } from '@/lib/filter-query';
import { somes } from '@/lib/somes';
import { useDebounced } from '@/lib/use-debounced';
import { spacing } from '@/theme/layout';

import { partiesFor, useFilterSources, withCount, type Sheet } from './filter-sources';

type Props = {
  control: ReactNode;
};

export function VotesList({ control }: Props) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(emptyVoteFilters);
  const [sheet, setSheet] = useState<Sheet>(null);

  const debouncedSearch = useDebounced(search);
  const query = voteResultsQuery(filters, debouncedSearch, 1);

  const results = useInfiniteQuery({
    queryKey: ['vote-results', query],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      somes.voteResults.search(voteResultsQuery(filters, debouncedSearch, pageParam)),
    getNextPageParam: (last, pages) => (pages.length < last.max_page ? pages.length + 1 : undefined),
  });

  const { topics, periods } = useFilterSources();

  const parties = useQuery({
    queryKey: ['parties-per-gp'],
    queryFn: () => somes.reference.partiesPerGp(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const counts = voteFilterCounts(filters);
  const items = results.data?.pages.flatMap((page) => page.vote_results) ?? [];
  const updatedAt = results.data?.pages[0]?.updated_at;

  const header = (
    <>
      {control}

      <ScreenTitle
        title="Vergangene Abstimmungsergebnisse"
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
            label={withCount('Parteien', counts.parties)}
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
        keyExtractor={(voteResult) => String(voteResult.id)}
        renderItem={(voteResult) => <VoteResultCard voteResult={voteResult} />}
        isPending={results.isPending}
        isError={results.isError}
        errorMessage="Abstimmungen konnten nicht geladen werden."
        emptyMessage="Keine Abstimmungsergebnisse gefunden"
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

      <PartySheet
        visible={sheet === 'second'}
        parties={partiesFor(parties.data, filters.gp)}
        selected={filters.partyVotes}
        onChange={(partyVotes) => setFilters({ ...filters, partyVotes })}
        onClose={() => setSheet(null)}
      />

      <VoteGenericSheet
        visible={sheet === 'generic'}
        periods={periods}
        filters={filters}
        onChange={setFilters}
        onClose={() => setSheet(null)}
      />
    </>
  );
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
