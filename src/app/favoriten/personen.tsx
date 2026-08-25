import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { delegate_by_id } from '@/api/api';
import { unwrap, url } from '@/api/client';
import { OptionGroup } from '@/components/filters/option-group';
import { SubScreen } from '@/components/layout/sub-screen';
import { Card } from '@/components/ui/card';
import { Notice } from '@/components/ui/notice';
import { ScreenTitle } from '@/components/ui/screen';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useFavorite, useFavoriteDelegates, useUpdateFavoriteInterval } from '@/lib/favorites';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, DelegateFavo } from '@/types';

const AVATAR = 48;

/** somes-frontend's "Infoabstand" select, same values and captions. */
const INTERVALS = [
  { label: 'Jede Woche', value: 7 },
  { label: 'Jede 2. Woche', value: 14 },
  { label: 'Jeden Monat', value: 30 },
  { label: 'Jeden 2. Monat', value: 60 },
] as const;

export default function FavoriteDelegatesScreen() {
  const favorites = useFavoriteDelegates();
  const entries = favorites.data ?? [];

  // One request per favourite, as on the web — somes-api has no batch lookup.
  const delegates = useQueries({
    queries: entries.map((favo) => ({
      queryKey: ['delegate', String(favo.delegate_id)],
      queryFn: async () => unwrap(await delegate_by_id(favo.delegate_id)),
    })),
  });

  return (
    <SubScreen refreshing={favorites.isRefetching} onRefresh={() => favorites.refetch()}>
      <ScreenTitle
        title="Favorisierte Personen"
        subtitle="Lege fest, wie oft du über ihre Aktivitäten informiert wirst."
      />

      {favorites.isPending ? (
        <CardSkeleton />
      ) : favorites.isError ? (
        <Notice message="Favoriten konnten nicht geladen werden." />
      ) : entries.length === 0 ? (
        <Notice message="Keine favorisierten Personen vorhanden." />
      ) : (
        entries.map((favo, index) => (
          <FavoriteDelegate
            key={favo.delegate_id}
            favo={favo}
            delegate={delegates[index]?.data}
          />
        ))
      )}
    </SubScreen>
  );
}

function FavoriteDelegate({
  favo,
  delegate,
}: {
  favo: DelegateFavo;
  delegate: Delegate | undefined;
}) {
  const router = useRouter();
  const updateInterval = useUpdateFavoriteInterval();
  const { toggle, isPending } = useFavorite('delegate', favo.delegate_id);
  const party = delegate?.current_party ?? delegate?.party ?? null;
  const partyColor = usePartyColor(party);

  return (
    <Card variant="outlined" elevation="row" style={styles.card}>
      <Pressable
        onPress={() =>
          router.push({ pathname: '/abgeordnete/[id]', params: { id: favo.delegate_id } })
        }
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <Image
          source={{ uri: `${url}assets/${favo.delegate_id}.jpg` }}
          style={styles.avatar}
          accessibilityLabel={delegate?.name}
        />
        <View style={styles.grow}>
          <Text style={typography.rowTitle} numberOfLines={1}>
            {delegate?.name ?? 'Wird geladen…'}
          </Text>
          {party ? (
            <View style={styles.meta}>
              <View style={[styles.dot, { backgroundColor: partyColor }]} />
              <Text style={typography.caption}>{party}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textCaption} />
      </Pressable>

      <View style={styles.divider} />

      <OptionGroup
        title="Infoabstand"
        options={INTERVALS}
        value={favo.user_info_days}
        onChange={(user_info_days) =>
          updateInterval.mutate({ delegate_id: favo.delegate_id, user_info_days })
        }
      />

      <Pressable
        onPress={toggle}
        disabled={isPending}
        hitSlop={8}
        accessibilityRole="button"
        style={({ pressed }) => [styles.remove, pressed && styles.pressed]}>
        <Ionicons name="heart-dislike-outline" size={16} color={colors.danger} />
        <Text style={[typography.caption, styles.removeLabel]}>Aus Favoriten entfernen</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  grow: {
    flex: 1,
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.cardBorder,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  removeLabel: {
    color: colors.danger,
  },
  pressed: {
    opacity: 0.6,
  },
});
