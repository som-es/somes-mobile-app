import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { FilterPill } from '@/components/ui/filter-pill';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { SearchField } from '@/components/ui/search-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

const TABS = [
  { value: 'nationalrat', label: 'Nationalrat' },
  { value: 'regierung', label: 'Regierung' },
] as const;

type Tab = (typeof TABS)[number]['value'];

/**
 * Two views behind one segmented control, matching the design:
 *  - Nationalrat → vote results (`vote_results_per_page` / `..._by_search`)
 *  - Regierung   → ministerial proposals (`gov_proposals_per_page`)
 */
export default function AbstimmungenScreen() {
  const [tab, setTab] = useState<Tab>('nationalrat');
  const [search, setSearch] = useState('');

  const isNationalrat = tab === 'nationalrat';

  return (
    <Screen>
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />

      <ScreenTitle
        title={isNationalrat ? 'Vergangene Abstimmungsergebnisse' : 'Ministerialentwürfe'}
        subtitle={isNationalrat ? 'Noch keine Daten geladen' : 'Noch keine Daten geladen'}
        centered
      />

      <SearchField value={search} onChangeText={setSearch} />

      <View style={styles.filters}>
        <FilterPill label="Themen" />
        <FilterPill label={isNationalrat ? 'Parteien' : 'Ministerien'} />
        <FilterPill label="Filter" />
      </View>

      <Card>
        <Text style={typography.bodyMuted}>
          {isNationalrat ? 'Abstimmungskarten' : 'Ministerialentwurfskarten'}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
