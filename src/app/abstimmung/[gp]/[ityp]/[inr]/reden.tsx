import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { ResultList } from '@/components/lists/result-list';
import { SpeechRow } from '@/components/detail/speech-list';
import { ScreenTitle } from '@/components/ui/screen';
import { RowSkeleton } from '@/components/ui/skeleton';
import { somes } from '@/lib/somes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Speech } from '@/types';

export default function SpeechesScreen() {
  const { gp, ityp, inr } = useLocalSearchParams<{ gp: string; ityp: string; inr: string }>();
  const router = useRouter();

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

  const speeches = vote.data?.speeches ?? [];

  const header = (
    <>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="arrow-back" size={18} color={colors.text} />
        <Text style={typography.subtitle}>Zurück</Text>
      </Pressable>

      <ScreenTitle title="Reden" centered />
    </>
  );

  return (
    <View style={styles.root}>
      <AppHeader />
      {/* a FlatList only mounts the rows near the viewport, unlike the inline
          preview's plain ScrollView, so a long speech list no longer has to
          render every row up front */}
      <ResultList
        header={header}
        items={speeches}
        keyExtractor={(item: Speech) => String(item.id)}
        renderItem={(item: Speech) =>
          delegatesLoading ? (
            <RowSkeleton />
          ) : (
            <SpeechRow item={item} delegate={delegates.data?.get(item.speech.delegate_id)} />
          )
        }
        isPending={vote.isPending}
        isError={vote.isError}
        errorMessage="Reden konnten nicht geladen werden."
        emptyMessage="Keine Reden vorhanden"
        onEndReached={() => {}}
        isFetchingNextPage={false}
        refreshing={vote.isRefetching}
        onRefresh={() => vote.refetch()}
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
});
