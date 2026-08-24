import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { url } from '@/api/client';
import { Card } from '@/components/ui/card';
import { age } from '@/lib/date';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate } from '@/types';

/** Wide enough for the portrait plus the gap, so the table head can line up. */
export const AVATAR = 40;

type Props = {
  delegate: Delegate;
};

/**
 * A person row on the Abgeordnete list: portrait, name, party, age.
 *
 * The three text columns carry the same flex weights as the `Name / Partei /
 * Alter` header above the list, which is the only thing keeping the two
 * aligned — change one and change the other.
 */
export function DelegateCard({ delegate }: Props) {
  const router = useRouter();
  const party = partyLabel(delegate.party);
  const partyColor = usePartyColor(delegate.party);
  const years = age(delegate.birthdate);

  return (
    <Card
      elevation="row"
      onPress={() =>
        router.push({ pathname: '/abgeordnete/[id]', params: { id: delegate.id } })
      }>
      <View style={styles.row}>
        <Image
          source={{ uri: `${url}assets/${delegate.id}.jpg` }}
          style={styles.avatar}
          accessibilityLabel={delegate.name}
        />

        <Text style={[typography.rowTitle, styles.nameCol]} numberOfLines={2}>
          {delegate.name}
        </Text>

        <View style={[styles.partyCol, styles.party]}>
          <View style={[styles.dot, { backgroundColor: partyColor }]} />
          <Text style={typography.rowMeta} numberOfLines={1}>
            {party}
          </Text>
        </View>

        <Text style={[typography.rowMeta, styles.ageCol]}>{years ?? '–'}</Text>

        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
}

/** The web substitutes this for a blank or "ohne Klub" party before rendering. */
function partyLabel(party: string | null): string {
  if (!party || party.toUpperCase() === 'OK') return 'Ohne Klub';
  return party;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  nameCol: { flex: 3 },
  partyCol: { flex: 2 },
  ageCol: { flex: 1 },
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
});
