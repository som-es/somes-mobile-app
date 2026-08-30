import { Image, StyleSheet, Text, View } from 'react-native';

import { url } from '@/api/client';
import { Card } from '@/components/ui/card';
import { age } from '@/lib/date';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColor } from '@/theme/party-colors';
import { typography } from '@/theme/typography';
import type { Delegate } from '@/types';

const PORTRAIT = 100;

type Props = {
  delegate: Delegate;
};

export function DelegateHeaderCard({ delegate }: Props) {
  const years = age(delegate.birthdate);
  const party = delegate.party || delegate.current_party;
  const partyColor = usePartyColor(party);

  // Committees first; the mandates stand in when a member sits on none.
  const divisions = delegate.divisions ?? [];
  const bullets = unique(
    divisions.length > 0
      ? divisions
      : (delegate.active_mandates ?? delegate.mandates_at_time ?? [])
          .map((mandate) => mandate.name)
          .filter((name): name is string => Boolean(name))
  );

  return (
    <Card>
      <View style={styles.head}>
        <Image
          source={{ uri: `${url}assets/${delegate.id}.jpg` }}
          style={styles.portrait}
          accessibilityLabel={delegate.name}
        />

        <Text style={styles.name}>
          {years === null ? delegate.name : `${delegate.name} - ${years}`}
        </Text>

        {party ? (
          <View style={styles.party}>
            <View style={[styles.dot, { backgroundColor: partyColor }]} />
            <Text style={typography.body}>{party}</Text>
          </View>
        ) : null}
      </View>

      {bullets.length > 0 ? (
        <View style={styles.bullets}>
          {bullets.map((value) => (
            <View key={value} style={styles.bullet}>
              <Text style={typography.body}>{'\u2022'}</Text>
              <Text style={[typography.body, styles.bulletText]}>{value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={[typography.caption, styles.copyright]}>
        © {delegate.image_copyright ?? 'Parlamentsdirektion'}
      </Text>
    </Card>
  );
}

/** A member can hold the same mandate name across several periods. */
function unique(values: string[]): string[] {
  return [...new Set(values)];
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  /** The design sets the member's name at 22/600 — larger than `detailTitle`. */
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textTitle,
    textAlign: 'center',
  },
  portrait: {
    width: PORTRAIT,
    height: PORTRAIT,
    borderRadius: 999,
    backgroundColor: colors.cardRaised,
  },
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  bullets: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  bullet: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  copyright: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
