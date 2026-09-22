import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueries } from '@tanstack/react-query';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VoteResultCard } from '@/components/cards/vote-result-card';
import { SubScreen } from '@/components/layout/sub-screen';
import { Notice } from '@/components/ui/notice';
import { ScreenTitle } from '@/components/ui/screen';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useFavorite, useFavoriteVotes } from '@/lib/favorites';
import { somes } from '@/lib/somes';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { VoteResult } from '@/types';

export default function FavoriteVotesScreen() {
  const { t } = useTranslation('favorites');
  const favorites = useFavoriteVotes();
  const entries = favorites.data ?? [];

  const votes = useQueries({
    queries: entries.map((favo) => ({
      queryKey: ['vote-result', String(favo.vote_result_id)],
      queryFn: () => somes.voteResults.byId(favo.vote_result_id),
    })),
  });

  return (
    <SubScreen refreshing={favorites.isRefetching} onRefresh={() => favorites.refetch()}>
      <ScreenTitle title={t('votes.title')} />

      {favorites.isPending ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : favorites.isError ? (
        <Notice message={t('loadError')} />
      ) : entries.length === 0 ? (
        <Notice message={t('votes.empty')} />
      ) : (
        entries.map((favo, index) => (
          <FavoriteVote
            key={favo.vote_result_id}
            id={favo.vote_result_id}
            voteResult={votes[index]?.data}
          />
        ))
      )}
    </SubScreen>
  );
}

function FavoriteVote({ id, voteResult }: { id: number; voteResult: VoteResult | undefined }) {
  const { t } = useTranslation('favorites');
  const { toggle, isPending } = useFavorite('vote', id);

  return (
    <View style={styles.item}>
      {voteResult ? <VoteResultCard voteResult={voteResult} /> : <CardSkeleton />}

      <Pressable
        onPress={toggle}
        disabled={isPending}
        hitSlop={8}
        accessibilityRole="button"
        style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
        <Ionicons name="heart-dislike-outline" size={16} color={colors.danger} />
        <Text style={[typography.caption, styles.removeLabel]}>{t('remove')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.sm,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
  },
  removeLabel: {
    color: colors.danger,
  },
  pressed: {
    opacity: 0.6,
  },
});
