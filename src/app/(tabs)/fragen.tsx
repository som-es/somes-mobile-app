import Ionicons from '@expo/vector-icons/Ionicons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { QuestionCard } from '@/components/cards/question-card';
import { MultiSelectSheet } from '@/components/filters/multi-select-sheet';
import { ResultList } from '@/components/lists/result-list';
import { withCount } from '@/components/lists/filter-sources';
import { Chip } from '@/components/ui/chip';
import { ComingSoon } from '@/components/ui/coming-soon';
import { FilterPill } from '@/components/ui/filter-pill';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { useAuth } from '@/lib/use-auth';
import { useCountry } from '@/lib/use-country';
import { useDebounced } from '@/lib/use-debounced';
import { useLocale } from '@/lib/use-locale';
import { colors, shadows } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { PublicDelegateQuestion } from '@/types';

const FAB_SIZE = 56;

const ENTRIES_PER_PAGE = 16;

type QuickFilter = 'latest_questions' | 'latest_answers' | 'unanswered' | 'mine';

const QUICK_FILTER_KEYS: Record<Exclude<QuickFilter, 'mine'>, string> = {
  latest_questions: 'list.quickFilters.latestQuestions',
  latest_answers: 'list.quickFilters.latestAnswers',
  unanswered: 'list.quickFilters.unanswered',
};

const QUICK_FILTER_VALUES: Exclude<QuickFilter, 'mine'>[] = [
  'latest_questions',
  'latest_answers',
  'unanswered',
];

function latestAnswerAt(question: PublicDelegateQuestion): number {
  return question.answers.reduce(
    (latest, answer) => Math.max(latest, new Date(answer.received_at).getTime()),
    0
  );
}

export default function FragenScreen() {
  const { t } = useTranslation('questions');
  const locale = useLocale();
  const router = useRouter();
  const country = useCountry();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('latest_questions');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedSearch = useDebounced(search);

  const eurovocTopics = useQuery({
    queryKey: ['eurovoc-topics'],
    queryFn: () => somes.reference.eurovocTopics(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const topicIdByLabel = useMemo(
    () => new Map((eurovocTopics.data ?? []).map((topic) => [topic.topic, topic.id])),
    [eurovocTopics.data]
  );
  const topicIds = useMemo(
    () => selectedTopics.map((label) => topicIdByLabel.get(label)).filter((id): id is string => !!id),
    [selectedTopics, topicIdByLabel]
  );

  const results = useInfiniteQuery({
    queryKey: ['delegate-questions', topicIds, debouncedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      somes.delegateQuestions.search({
        page: pageParam,
        entriesPerPage: ENTRIES_PER_PAGE,
        search: debouncedSearch || undefined,
        topicIds,
        sort: 'Desc',
      }),
    getNextPageParam: (last, pages) => (pages.length < last.max_page ? pages.length + 1 : undefined),
    enabled: quickFilter !== 'mine',
  });

  const updatedAt = results.data?.pages[0]?.updated_at;

  // "Unbeantwortet" and "Neuste Antworten" filter/sort the already-loaded pages
  // client-side: the search endpoint has no `answered` filter or answer-date
  // sort yet (see the plan's backend wire-contract §1.2/§1.3), so this is exact
  // only within what has been fetched so far, and gets more complete as the
  // list is scrolled further.
  const items = useMemo(() => {
    const allItems = results.data?.pages.flatMap((page) => page.delegate_questions) ?? [];
    if (quickFilter === 'unanswered') return allItems.filter((question) => question.answers.length === 0);
    if (quickFilter === 'latest_answers') {
      return allItems
        .filter((question) => question.answers.length > 0)
        .slice()
        .sort((a, b) => latestAnswerAt(b) - latestAnswerAt(a));
    }
    return allItems;
  }, [results.data, quickFilter]);

  const header = (
    <>
      <ScreenTitle
        title={t('list.title')}
        subtitle={updatedAt ? t('list.updatedAt', { date: isoToDotDate(updatedAt, locale) }) : undefined}
        centered
      />

      {country !== 'at' ? (
        <Text style={typography.caption}>{t('notAvailableForEu')}</Text>
      ) : null}

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchField value={search} onChangeText={setSearch} />
        </View>
        <FilterPill
          label={withCount(t('list.topicsFilter'), selectedTopics.length)}
          onPress={() => setSheetOpen(true)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        {QUICK_FILTER_VALUES.map((filter) => (
          <Chip
            key={filter}
            label={t(QUICK_FILTER_KEYS[filter])}
            selected={quickFilter === filter}
            onPress={() => setQuickFilter(filter)}
          />
        ))}
        {isAuthenticated ? (
          <Chip
            label={t('list.mine')}
            selected={quickFilter === 'mine'}
            onPress={() => setQuickFilter('mine')}
          />
        ) : null}
      </ScrollView>
    </>
  );

  const topicSheet = (
    <MultiSelectSheet
      visible={sheetOpen}
      title={t('topicsSheet.title')}
      values={[...topicIdByLabel.keys()]}
      selected={selectedTopics}
      onChange={setSelectedTopics}
      onClose={() => setSheetOpen(false)}
      searchable
      searchPlaceholder={t('topicsSheet.searchPlaceholder')}
    />
  );

  // asking is not possible for the EU parliament (the backend 503s), so the
  // button that would only fail on press is left out entirely rather than shown
  const fab =
    country === 'at' ? (
      <Pressable
        onPress={() => router.push(isAuthenticated ? '/frage/neu' : '/anmelden')}
        accessibilityRole="button"
        accessibilityLabel={t('askButton')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
        <Ionicons name="add" size={28} color={colors.onAccent} />
      </Pressable>
    ) : null;

  if (quickFilter === 'mine') {
    return (
      <>
        <Screen>
          {header}
          <ComingSoon
            icon="chatbubbles-outline"
            title={t('list.comingSoon.title')}
            description={t('list.comingSoon.description')}
          />
        </Screen>

        {fab}
        {topicSheet}
      </>
    );
  }

  return (
    <>
      <ResultList
        header={header}
        items={items}
        keyExtractor={(question) => String(question.id)}
        renderItem={(question) => <QuestionCard question={question} />}
        isPending={results.isPending}
        isError={results.isError}
        errorMessage={t('list.error')}
        emptyMessage={t('list.empty')}
        onEndReached={() => {
          if (results.hasNextPage && !results.isFetchingNextPage) results.fetchNextPage();
        }}
        isFetchingNextPage={results.isFetchingNextPage}
        refreshing={results.isRefetching && !results.isFetchingNextPage}
        onRefresh={() => results.refetch()}
      />

      {fab}
      {topicSheet}
    </>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchField: {
    flex: 1,
  },
  chips: {
    gap: spacing.xs,
    paddingRight: spacing.screen,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    ...shadows.row,
  },
  fabPressed: {
    opacity: 0.85,
  },
});
