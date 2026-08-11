import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/**
 * Abgeordnete detail. Backed by `delegate_by_id()` plus
 * `general_delegate_info()`, which carries the political position, absences,
 * topic scores, speeches and named votes the design shows.
 */
export default function AbgeordneteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader />
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={typography.body}>Zurück</Text>
        </Pressable>

        <Card>
          <Text style={typography.cardTitle}>Abgeordnete:r #{id}</Text>
          <Text style={typography.bodyMuted}>Stammdaten werden geladen</Text>
        </Card>

        <Section title="Politische Haltung & Richtung" />
        <Section title="Abwesenheiten" />
        <Section title="Themen" />
        <Section title="Letzte Reden" />
        <Section title="Letzte namentliche Abstimmungen" />
      </Screen>
    </View>
  );
}

function Section({ title }: { title: string }) {
  return (
    <Card>
      <Text style={typography.cardTitle}>{title}</Text>
      <Text style={typography.bodyMuted}>Noch keine Daten geladen</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
