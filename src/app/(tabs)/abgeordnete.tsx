import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FilterPill } from '@/components/ui/filter-pill';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { usePartyColors } from '@/theme/party-colors';
import { typography } from '@/theme/typography';

/**
 * Abgeordnete list. Backed by `delegates_search_persons()`, filtered by the
 * party chips. Party chip colours come from the API, never hardcoded.
 */
export default function AbgeordneteScreen() {
  const [search, setSearch] = useState('');
  const [party, setParty] = useState<string | null>(null);
  const { data: partyColors } = usePartyColors();
  const router = useRouter();

  return (
    <Screen>
      <ScreenTitle
        title="Abgeordnete des Nationalrats"
        subtitle="Noch keine Daten geladen"
        centered
      />

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchField value={search} onChangeText={setSearch} />
        </View>
        <FilterPill label="Filter" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Chip
          label="Alle"
          color={colors.textMuted}
          dimmed={party !== null}
          onPress={() => setParty(null)}
        />
        {[...(partyColors?.entries() ?? [])].map(([name, color]) => (
          <Chip
            key={name}
            label={name}
            color={color}
            dimmed={party !== null && party !== name}
            onPress={() => setParty(name)}
          />
        ))}
      </ScrollView>

      <View style={styles.tableHead}>
        <Text style={[typography.tableHead, styles.nameCol]}>Name</Text>
        <Text style={[typography.tableHead, styles.partyCol]}>Partei</Text>
        <Text style={[typography.tableHead, styles.ageCol]}>Alter</Text>
      </View>

      <Card onPress={() => router.push('/abgeordnete/1')} elevation="row">
        <View style={styles.row}>
          <Text style={typography.bodyMuted}>Abgeordnetenliste</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchField: {
    flex: 1,
  },
  chips: {
    gap: spacing.xs,
    paddingRight: spacing.screen,
  },
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  nameCol: { flex: 3 },
  partyCol: { flex: 2 },
  ageCol: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
