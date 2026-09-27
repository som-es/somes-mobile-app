import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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

const PORTRAIT = 100;

type Props = {
  delegate: Delegate;
};

export function DelegateHeaderCard({ delegate }: Props) {
  const { t } = useTranslation('delegates');
  const country = useCountry();
  const years = age(delegate.birthdate);
  const party = delegate.party || delegate.current_party;
  const partyColor = usePartyColor(party);
  const copyrightFallback =
    country === 'eu' ? t('header.copyrightFallbackEu') : t('header.copyrightFallbackAt');

  // committees first, the mandates stand in when a member sits on none
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
        <Avatar
          uri={delegateAvatarUrl(country, delegate.id, delegate.image_url)}
          size={PORTRAIT}
          accessibilityLabel={delegate.name}
          style={styles.portrait}
        />

        <View style={styles.nameGroup}>
          <Text style={styles.name}>{delegate.name}</Text>
          {years !== null ? <Text style={[typography.caption, styles.age]}>{years}</Text> : null}
        </View>

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
        © {delegate.image_copyright ?? copyrightFallback}
      </Text>
    </Card>
  );
}

/** a member can hold the same mandate name across several periods */
function unique(values: string[]): string[] {
  return [...new Set(values)];
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameGroup: {
    alignItems: 'center',
    gap: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textTitle,
    textAlign: 'center',
  },
  age: {
    textAlign: 'center',
  },
  portrait: {
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
