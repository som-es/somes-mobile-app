import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionGroup } from '@/components/filters/option-group';
import { SubScreen } from '@/components/layout/sub-screen';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Notice } from '@/components/ui/notice';
import { ScreenTitle } from '@/components/ui/screen';
import { CardSkeleton } from '@/components/ui/skeleton';
import { useFavorite, useFavoriteDelegates, useUpdateFavoriteInterval } from '@/lib/favorites';
import { delegateAvatarUrl, somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate, DelegateFavo } from '@/types';

const AVATAR = 48;

/** the infoabstand select from somes-frontend, same values and captions */
const INTERVALS = [
  { label: 'Jede Woche', value: 7 },
  { label: 'Jede 2. Woche', value: 14 },
  { label: 'Jeden Monat', value: 30 },
  { label: 'Jeden 2. Monat', value: 60 },
] as const;

export default function FavoriteDelegatesScreen() {
  const favorites = useFavoriteDelegates();
  const entries = favorites.data ?? [];

  // one request per favourite like on the web, somes-api has no batch lookup
  const delegates = useQueries({
    queries: entries.map((favo) => ({
      queryKey: ['delegate', String(favo.delegate_id)],
      queryFn: () => somes.delegates.byId(favo.delegate_id),
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
  const country = useCountry();
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
        <Avatar
          uri={delegateAvatarUrl(country, favo.delegate_id, delegate?.image_url ?? null)}
          size={AVATAR}
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
