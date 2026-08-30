import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { AccountCard } from '@/components/profile/account-card';
import { DangerZoneCard } from '@/components/profile/danger-zone-card';
import { FavoritesLinkCards } from '@/components/profile/favorites-link-card';
import { InterestsCard } from '@/components/profile/interests-card';
import { Card } from '@/components/ui/card';
import { ComingSoon } from '@/components/ui/coming-soon';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { useAuth } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export default function ProfilScreen() {
  const { isAuthenticated } = useAuth();

  return (
    <Screen>
      <ScreenTitle title="Benutzerprofil" subtitle="Verwalte deine Einstellungen und Präferenzen" />

      <AccountCard />

      {isAuthenticated ? (
        <>
          <InterestsCard />
          <FavoritesLinkCards />

          <Card>
            <ComingSoon
              icon="notifications-outline"
              title="Benachrichtigungen"
              description="Coming Soon."
            />
          </Card>

          <DangerZoneCard />
        </>
      ) : (
        <Card style={styles.blurbCard}>
          <Text style={typography.cardHeading}>Mit einem Konto</Text>
          <View style={styles.benefits}>
            {BENEFITS.map((benefit) => (
              <View key={benefit} style={styles.benefit}>
                <Ionicons name="checkmark" size={16} color={colors.accent} />
                <Text style={[typography.bodyMuted, styles.benefitLabel]}>{benefit}</Text>
              </View>
            ))}
          </View>

          <Text style={typography.caption}>
            Alle Abstimmungen, Ministerialentwürfe und Abgeordneten kannst du auch ohne Konto
            ansehen.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const BENEFITS = [
  'Themen wählen, die dich interessieren',
  'Abgeordnete und Abstimmungen merken',
  'Deine Auswahl auf allen Geräten behalten',
];

const styles = StyleSheet.create({
  blurbCard: {
    gap: spacing.md,
  },
  benefits: {
    gap: spacing.sm,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitLabel: {
    flex: 1,
  },
});
