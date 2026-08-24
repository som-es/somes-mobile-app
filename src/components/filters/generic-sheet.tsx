import { ScrollView, StyleSheet } from 'react-native';

import { OptionGroup } from '@/components/filters/option-group';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { DelegateFilters, ProposalFilters, VoteFilters } from '@/lib/filter-query';
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

const MANDATE_KIND = [
  { label: 'egal', value: null },
  { label: 'Regierung', value: true },
  { label: 'Nationalrat', value: false },
] as const;

const ACTIVE_MANDATE = [
  { label: 'egal', value: null },
  { label: 'Ja', value: true },
  { label: 'Nein', value: false },
] as const;

const MIND_PREVIOUS_PARTY = [
  { label: 'Ja', value: true },
  { label: 'Nein', value: false },
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

type DelegateProps = PeriodProps & {
  visible: boolean;
  filters: DelegateFilters;
  onChange: (filters: DelegateFilters) => void;
  onClose: () => void;
};

/**
 * The Abgeordnete filter sheet — the web's four `genericFilters` groups plus
 * the period picker, which lives in the same popover there.
 *
 * Caveat worth knowing while reading the results: `delegates_search_persons()`
 * sends the period as `active_gov_gps` whenever Mandatsart is "Regierung" and
 * as `active_gps` otherwise. somes-frontend has an unreachable `active_nr_gps`
 * branch there; our port reproduces the same behaviour byte for byte so the two
 * stay diffable. Fix it in somes-frontend first, not here.
 */
export function DelegateGenericSheet({
  visible,
  periods,
  filters,
  onChange,
  onClose,
}: DelegateProps) {
  return (
    <BottomSheet
      visible={visible}
      title="Filter"
      onClose={onClose}
      onReset={() =>
        onChange({
          ...filters,
          onlyGov: null,
          hasActiveMandate: null,
          mindPreviousPartyMembership: true,
        })
      }>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <OptionGroup
          title="Legislaturperiode"
          options={periodOptions(periods)}
          value={filters.gp}
          onChange={(gp) => onChange({ ...filters, gp })}
        />
        <OptionGroup
          title="Mandatsart"
          options={MANDATE_KIND}
          value={filters.onlyGov}
          onChange={(onlyGov) => onChange({ ...filters, onlyGov })}
        />
        <OptionGroup
          title="Aktives Mandat"
          options={ACTIVE_MANDATE}
          value={filters.hasActiveMandate}
          onChange={(hasActiveMandate) => onChange({ ...filters, hasActiveMandate })}
        />
        <OptionGroup
          title="Ehemalige Parteizugehörigkeit beachten"
          options={MIND_PREVIOUS_PARTY}
          value={filters.mindPreviousPartyMembership}
          onChange={(mindPreviousPartyMembership) =>
            onChange({ ...filters, mindPreviousPartyMembership })
          }
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
