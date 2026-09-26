import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
import { useCountry } from '@/lib/use-country';
import { useDebounced } from '@/lib/use-debounced';
import { useLocale } from '@/lib/use-locale';
import { spacing } from '@/theme/layout';

import { partiesFor, useFilterSources, withCount, type Sheet } from './filter-sources';

type Props = {
  control: ReactNode;
};

export function VotesList({ control }: Props) {
  const { t } = useTranslation('votes');
  const locale = useLocale();
  const country = useCountry();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(() => emptyVoteFilters(country));
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
        title={t('votesList.title')}
        subtitle={updatedAt ? t('delegates:list.updatedAt', { date: isoToDotDate(updatedAt, locale) }) : undefined}
        centered
      />

      <SearchField value={search} onChangeText={setSearch} />

      <View style={styles.filters}>
        <View style={styles.slot}>
          <FilterPill
            label={withCount(t('votesList.filterTopics'), counts.topics)}
            onPress={() => setSheet('topics')}
          />
        </View>
        <View style={styles.slot}>
          <FilterPill
            label={withCount(t('votesList.filterParties'), counts.parties)}
            onPress={() => setSheet('second')}
          />
        </View>
        <View style={styles.slot}>
          <FilterPill
            label={withCount(t('votesList.filterGeneric'), counts.generic)}
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
        errorMessage={t('votesList.error')}
        emptyMessage={t('votesList.empty')}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) results.fetchNextPage();
        }}
        isFetchingNextPage={results.isFetchingNextPage}
        refreshing={results.isRefetching && !results.isFetchingNextPage}
        onRefresh={() => results.refetch()}
      />

      <MultiSelectSheet
        visible={sheet === 'topics'}
        title={t('votesList.filterTopics')}
        values={topics}
        selected={filters.topics}
        onChange={(selected) => setFilters({ ...filters, topics: selected })}
        onClose={() => setSheet(null)}
        searchable
        searchPlaceholder={t('search.topicPlaceholder')}
      />

      <PartySheet
        visible={sheet === 'second'}
        parties={partiesFor(parties.data, filters.gp, country)}
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
