import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { age } from '@/lib/date';
import { delegateAvatarUrl } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate } from '@/types';

export const AVATAR = 40;

type Props = {
  delegate: Delegate;
};

/** the column flex weights have to match the header above the list */
export function DelegateCard({ delegate }: Props) {
  const router = useRouter();
  const country = useCountry();
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
        <Avatar
          uri={delegateAvatarUrl(country, delegate.id, delegate.image_url)}
          size={AVATAR}
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

/** the web puts this in place of a blank or ohne klub party */
export function partyLabel(party: string | null): string {
  if (!party || party.toUpperCase() === 'OK') return 'Ohne Klub';
  return party;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
