import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/**
 * Home. Sections per the design: next Nationalrat session, latest vote results
 * (`latest_vote_results()`), latest ministerial proposals
 * (`latest_ministrial_proposals(30)`). Data wiring is the next pass.
 */
export default function HomeScreen() {
  return (
    <Screen>
      <Card style={styles.sessionCard}>
        <Text style={typography.cardTitle}>Nächste Nationalratssitzung</Text>
        <Text style={typography.caption}>Termin wird geladen</Text>
      </Card>

      <View style={styles.section}>
        <ScreenTitle title="Letzte Abstimmungen" subtitle="Noch keine Daten geladen" section />
        <Placeholder label="Abstimmungskarten" />
      </View>

      <View style={styles.section}>
        <ScreenTitle title="Ministerialentwürfe" subtitle="Der letzten 30 Tage" section />
        <Placeholder label="Ministerialentwurfskarten" />
      </View>
    </Screen>
  );
}

export function Placeholder({ label }: { label: string }) {
  return (
    <Card>
      <Text style={typography.bodyMuted}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sessionCard: {
    backgroundColor: colors.sessionCard,
  },
});
