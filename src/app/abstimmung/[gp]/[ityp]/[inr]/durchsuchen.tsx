import { euCountryName } from '@som-es/somes-ts';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { NamedVoteRow } from '@/components/detail/named-vote-row';
import { MultiSelectSheet } from '@/components/filters/multi-select-sheet';
import { AppHeader } from '@/components/layout/app-header';
import { withCount } from '@/components/lists/filter-sources';
import { ResultList } from '@/components/lists/result-list';
import { FilterPill } from '@/components/ui/filter-pill';
import { ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { RowSkeleton } from '@/components/ui/skeleton';
import { behaviorLabel, VOTING_BEHAVIOR_VALUES, votingBehaviorOf } from '@/lib/named-vote-behavior';
import { somes } from '@/lib/somes';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { RollCallVote } from '@/types';

export default function SearchNamedVotesScreen() {
  const { t } = useTranslation('votes');
  const locale = useLocale();
  const countryLocale = locale === 'de-AT' ? 'de' : 'en';
  const behaviorValues = VOTING_BEHAVIOR_VALUES.map((value) => behaviorLabel(t, value));
  const { gp, ityp, inr } = useLocalSearchParams<{ gp: string; ityp: string; inr: string }>();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [parties, setParties] = useState<string[]>([]);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [partySheetOpen, setPartySheetOpen] = useState(false);
  const [behaviorSheetOpen, setBehaviorSheetOpen] = useState(false);
  const [countrySheetOpen, setCountrySheetOpen] = useState(false);

  // same queryKey as the vote detail screen, so this is instant when it's already
  // cached and only shows the loading state on a cold/deep-linked open
  const vote = useQuery({
    queryKey: ['vote-result', gp, ityp, inr],
    queryFn: () => somes.voteResults.byPath(gp, ityp, inr),
  });

  const activityDate = vote.data?.legislative_initiative.nr_plenary_activity_date;

  const delegates = useQuery({
    queryKey: ['delegates-at', activityDate],
    queryFn: async () => {
      const delegatesAtDate = await somes.delegates.allAtDate(activityDate!);
      return new Map(delegatesAtDate.map((delegate) => [delegate.id, delegate]));
    },
    enabled: activityDate !== undefined,
    staleTime: 1000 * 60 * 60 * 24,
  });
  // enabled:false leaves isPending stuck true forever, so only treat it as
  // "still loading" while a fetch is actually in flight
  const delegatesLoading = delegates.isPending && delegates.fetchStatus === 'fetching';

  const namedVotes = useMemo(() => vote.data?.named_votes?.named_votes ?? [], [vote.data]);

  // party options are the vote's own voters, not the whole chamber
  const partyOptions = useMemo(
    () => [
      ...new Set(
        namedVotes
          .map((namedVote) => delegates.data?.get(namedVote.delegate_id)?.party)
          .filter((party): party is string => Boolean(party))
      ),
    ].sort(),
    [namedVotes, delegates.data]
  );

  // country options are the vote's own voters, not the whole chamber
  const countryOptions = useMemo(
    () =>
      [
        ...new Set(
          namedVotes
            .map((namedVote) => delegates.data?.get(namedVote.delegate_id)?.constituency)
            .filter((code): code is string => Boolean(code))
        ),
      ]
        .map((code) => euCountryName(code, countryLocale))
        .sort(),
    [namedVotes, delegates.data, countryLocale]
  );

  const needle = search.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      namedVotes.filter((namedVote) => {
        const delegate = delegates.data?.get(namedVote.delegate_id);

        if (needle && !(delegate?.name ?? '').toLowerCase().includes(needle)) return false;
        if (parties.length > 0 && (!delegate?.party || !parties.includes(delegate.party))) {
          return false;
        }
        if (behaviors.length > 0) {
          const label = behaviorLabel(t, votingBehaviorOf(namedVote));
          if (!behaviors.includes(label)) return false;
        }
        if (countries.length > 0) {
          const name = delegate?.constituency
            ? euCountryName(delegate.constituency, countryLocale)
            : undefined;
          if (!name || !countries.includes(name)) return false;
        }

        return true;
      }),
    [namedVotes, delegates.data, needle, parties, behaviors, countries, t, countryLocale]
  );

  const header = (
    <>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={18} color={colors.text} />
        <Text style={typography.subtitle}>{t('common:detail.back')}</Text>
      </Pressable>

      <ScreenTitle title={t('detail.search')} centered />

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('search.namePlaceholder')}
      />

      <View style={styles.filters}>
        <FilterPill
          grow={true}
          label={withCount(t('filters.parties'), parties.length)}
          onPress={() => setPartySheetOpen(true)}
        />
        <FilterPill
          grow={true}
          label={withCount(t('filters.behavior'), behaviors.length)}
          onPress={() => setBehaviorSheetOpen(true)}
        />
        <FilterPill
          grow={true}
          label={withCount(t('filters.countryOfOrigin'), countries.length)}
          onPress={() => setCountrySheetOpen(true)}
        />
      </View>
    </>
  );

  return (
    <View style={styles.root}>
      <AppHeader />
      <ResultList
        header={header}
        items={filtered}
        keyExtractor={(item: RollCallVote) => String(item.id)}
        renderItem={(item: RollCallVote) =>
          delegatesLoading ? (
            <RowSkeleton />
          ) : (
            <NamedVoteRow vote={item} delegate={delegates.data?.get(item.delegate_id)} />
          )
        }
        isPending={vote.isPending}
        isError={vote.isError}
        errorMessage={t('votesList.error')}
        emptyMessage={t('delegates:list.empty')}
        onEndReached={() => {}}
        isFetchingNextPage={false}
        refreshing={vote.isRefetching}
        onRefresh={() => vote.refetch()}
      />

      <MultiSelectSheet
        visible={partySheetOpen}
        title={t('filters.parties')}
        values={partyOptions}
        selected={parties}
        onChange={setParties}
        onClose={() => setPartySheetOpen(false)}
      />

      <MultiSelectSheet
        visible={behaviorSheetOpen}
        title={t('filters.votingBehavior')}
        values={behaviorValues}
        selected={behaviors}
        onChange={setBehaviors}
        onClose={() => setBehaviorSheetOpen(false)}
      />

      <MultiSelectSheet
        visible={countrySheetOpen}
        title={t('filters.countryOfOrigin')}
        values={countryOptions}
        selected={countries}
        onChange={setCountries}
        onClose={() => setCountrySheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  filterButton: {
    flexGrow: 1.0,
  },
});
