import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SkeletonBar } from '@/components/ui/skeleton';
import { useFavoriteDelegates, useFavoriteVotes } from '@/lib/favorites';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export function FavoritesLinkCards() {
  const delegates = useFavoriteDelegates();
  const votes = useFavoriteVotes();

  return (
    <>
      <LinkCard
        title="Favorisierte Personen"
        href="/favoriten/personen"
        count={delegates.data?.length}
        isPending={delegates.isPending}
        isError={delegates.isError}
        empty="Keine favorisierten Personen vorhanden"
      />
      <LinkCard
        title="Favorisierte Abstimmungen"
        href="/favoriten/abstimmungen"
        count={votes.data?.length}
        isPending={votes.isPending}
        isError={votes.isError}
        empty="Keine favorisierten Abstimmungen vorhanden"
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
  const router = useRouter();
  const hasAny = (count ?? 0) > 0;

  const subtitle = isError
    ? 'Konnten nicht geladen werden'
    : hasAny
      ? `${count} gespeichert`
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
