import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
import { SkeletonBar } from '@/components/ui/skeleton';
import { useFavoriteDelegates, useFavoriteVotes } from '@/lib/favorites';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export function FavoritesLinkCards() {
  const { t } = useTranslation(['profile', 'favorites']);
  const delegates = useFavoriteDelegates();
  const votes = useFavoriteVotes();

  return (
    <>
      <LinkCard
        title={t('favorites:delegates.title')}
        href="/favoriten/personen"
        count={delegates.data?.length}
        isPending={delegates.isPending}
        isError={delegates.isError}
        empty={t('favorites:delegates.empty')}
      />
      <LinkCard
        title={t('favorites:votes.title')}
        href="/favoriten/abstimmungen"
        count={votes.data?.length}
        isPending={votes.isPending}
        isError={votes.isError}
        empty={t('favorites:votes.empty')}
      />
    </>
  );
}

function LinkCard({
  title,
  href,
  count,
  isPending,
  isError,
  empty,
}: {
  title: string;
  href: Href;
  count: number | undefined;
  isPending: boolean;
  isError: boolean;
  empty: string;
}) {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const hasAny = (count ?? 0) > 0;

  const subtitle = isError
    ? t('favoritesLinks.loadError')
    : hasAny
      ? t('favoritesLinks.savedCount', { count })
      : empty;

  return (
    <Card
      variant="outlined"
      // nothing to show behind an empty list, so it stays inert until there is
      onPress={hasAny ? () => router.push(href) : undefined}>
      <View style={styles.row}>
        <View style={styles.grow}>
          <Text style={typography.cardHeading}>{title}</Text>
          {isPending ? <SkeletonBar width={120} /> : <Text style={typography.caption}>{subtitle}</Text>}
        </View>
        {hasAny ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  grow: {
    flex: 1,
    gap: spacing.xs,
  },
});
