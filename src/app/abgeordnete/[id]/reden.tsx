import Ionicons from '@expo/vector-icons/Ionicons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/layout/app-header';
import { SpeechRow } from '@/components/detail/speech-row';
import { ResultList } from '@/components/lists/result-list';
import { Badge } from '@/components/ui/badge';
import { ScreenTitle } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { somes } from '@/lib/somes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Speech } from '@/types';

export default function DelegateSpeechesScreen() {
  const { t } = useTranslation('delegates');
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const delegate = useQuery({
    queryKey: ['delegate', id],
    queryFn: () => somes.delegates.byId(Number(id)),
    staleTime: 1000 * 60 * 60 * 24,
  });

  // speeches_per_page is 0 based, unlike every other paginated endpoint
  const speeches = useInfiniteQuery({
    queryKey: ['delegate-speeches-all', id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => somes.delegates.speeches(Number(id), pageParam),
    getNextPageParam: (last, pages) => (pages.length < last.max_page ? pages.length : undefined),
  });

  const items = useMemo(
    () => speeches.data?.pages.flatMap((page) => page.speeches) ?? [],
    [speeches.data]
  );
  const hasAiSummary = items.some((item) => item.ai_summary != null);

  const header = (
    <>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={18} color={colors.text} />
        <Text style={typography.subtitle}>{t('common:detail.back')}</Text>
      </Pressable>

      <ScreenTitle title={t('speeches.title')} centered />
      {hasAiSummary ? (
        <View style={styles.badgeRow}>
          <Badge label={t('common:detail.aiSummaryBadge')} />
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.root}>
      <AppHeader />
      <ResultList
        header={header}
        items={items}
        keyExtractor={(item: Speech) => String(item.id)}
        renderItem={(item: Speech) =>
          delegate.isPending ? (
            <RowSkeleton />
          ) : (
            <SpeechRow
              item={item}
              delegate={delegate.data}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onViewDetails={() =>
                router.push({
                  pathname: '/rede/[id]',
                  params: { id: String(item.id), delegateId: id },
                })
              }
            />
          )
        }
        isPending={speeches.isPending}
        isError={speeches.isError}
        errorMessage={t('speeches.loadError')}
        emptyMessage={t('speeches.empty')}
        onEndReached={() => {
          if (speeches.hasNextPage && !speeches.isFetchingNextPage) speeches.fetchNextPage();
        }}
        isFetchingNextPage={speeches.isFetchingNextPage}
        refreshing={speeches.isRefetching && !speeches.isFetchingNextPage}
        onRefresh={() => speeches.refetch()}
        separator="divider"
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
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
