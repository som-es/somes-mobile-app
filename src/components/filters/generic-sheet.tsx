import { ScrollView, StyleSheet } from 'react-native';

import { OptionGroup } from '@/components/filters/option-group';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { ProposalFilters, VoteFilters } from '@/lib/filter-query';
import { spacing } from '@/theme/layout';

/**
 * Option sets copied from the web's `genericFilters`, labels included — these
 * strings appear in the UI and match somes.at exactly.
 */
const ACCEPTED = [
  { label: 'egal', value: null },
  { label: 'angenommen', value: 'a' },
  { label: 'abgelehnt', value: 'd' },
  { label: 'frühzeitig abgelehnt', value: 'p' },
] as const;

const VOTE_TYPE = [
  { label: 'egal', value: null },
  { label: 'Gesetz', value: 'Law' },
  { label: 'Entschließung', value: 'Resolution' },
  { label: 'Abänderung', value: 'Amendment' },
  { label: 'Bericht', value: 'Report' },
] as const;

const MAJORITY = [
  { label: 'egal', value: null },
  { label: 'einfache Mehrheit', value: true },
  { label: '2/3 Mehrheit', value: false },
] as const;

const HAS_VOTE_RESULT = [
  { label: 'egal', value: null },
  { label: 'mit Abstimmung', value: true },
] as const;

type PeriodProps = {
  /** `gp` codes from `all_gps()`, newest first. */
  periods: string[];
};

type VoteProps = PeriodProps & {
  visible: boolean;
  filters: VoteFilters;
  onChange: (filters: VoteFilters) => void;
  onClose: () => void;
};

export function VoteGenericSheet({
  visible,
  periods,
  filters,
  onChange,
  onClose,
}: VoteProps) {
  return (
    <BottomSheet
      visible={visible}
      title="Filter"
      onClose={onClose}
      onReset={() =>
        onChange({ ...filters, accepted: null, voteType: null, simpleMajority: null })
      }>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <OptionGroup
          title="Legislaturperiode"
          options={periodOptions(periods)}
          value={filters.gp}
          onChange={(gp) => onChange({ ...filters, gp })}
        />
        <OptionGroup
          title="Angenommen"
          options={ACCEPTED}
          value={filters.accepted}
          onChange={(accepted) => onChange({ ...filters, accepted })}
        />
        <OptionGroup
          title="Antragstyp"
          options={VOTE_TYPE}
          value={filters.voteType}
          onChange={(voteType) => onChange({ ...filters, voteType })}
        />
        <OptionGroup
          title="notwendige Mehrheit"
          options={MAJORITY}
          value={filters.simpleMajority}
          onChange={(simpleMajority) => onChange({ ...filters, simpleMajority })}
        />
      </ScrollView>
    </BottomSheet>
  );
}

type ProposalProps = PeriodProps & {
  visible: boolean;
  filters: ProposalFilters;
  onChange: (filters: ProposalFilters) => void;
  onClose: () => void;
};

export function ProposalGenericSheet({
  visible,
  periods,
  filters,
  onChange,
  onClose,
}: ProposalProps) {
  return (
    <BottomSheet
      visible={visible}
      title="Filter"
      onClose={onClose}
      onReset={() => onChange({ ...filters, hasVoteResult: null })}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <OptionGroup
          title="Legislaturperiode"
          options={periodOptions(periods)}
          value={filters.gp}
          onChange={(gp) => onChange({ ...filters, gp })}
        />
        <OptionGroup
          title="Abstimmungsstatus"
          options={HAS_VOTE_RESULT}
          value={filters.hasVoteResult}
          onChange={(hasVoteResult) => onChange({ ...filters, hasVoteResult })}
        />
      </ScrollView>
    </BottomSheet>
  );
}

/** `null` is "Alle", which omits the `gp` parameter entirely. */
function periodOptions(periods: string[]) {
  return [{ label: 'Alle', value: null as string | null }, ...periods.map((gp) => ({ label: gp, value: gp }))];
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
