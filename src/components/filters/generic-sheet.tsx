import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { OptionGroup } from '@/components/filters/option-group';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { DelegateFilters, ProposalFilters, VoteFilters } from '@/lib/filter-query';
import { useCountry } from '@/lib/use-country';
import { spacing } from '@/theme/layout';
import type { LegisPeriod } from '@/types';

/** copied from the web, the labels are ui strings, resolved at render time via t() */
function acceptedOptions(t: TFunction) {
  return [
    { label: t('filters:any'), value: null },
    { label: t('filters:acceptedValue'), value: 'a' },
    { label: t('filters:rejected'), value: 'd' },
    { label: t('filters:rejectedEarly'), value: 'p' },
  ] as const;
}

function voteTypeOptions(t: TFunction) {
  return [
    { label: t('filters:any'), value: null },
    { label: t('votes:voteType.law'), value: 'Law' },
    { label: t('votes:voteType.resolution'), value: 'Resolution' },
    { label: t('votes:voteType.amendment'), value: 'Amendment' },
    { label: t('votes:voteType.report'), value: 'Report' },
  ] as const;
}

function majorityOptions(t: TFunction) {
  return [
    { label: t('filters:any'), value: null },
    { label: t('votes:majority.simple'), value: true },
    { label: t('votes:majority.twoThirds'), value: false },
  ] as const;
}

function hasVoteResultOptions(t: TFunction) {
  return [
    { label: t('filters:any'), value: null },
    { label: t('filters:withVoteResult'), value: true },
  ] as const;
}

function mandateKindOptions(t: TFunction) {
  return [
    { label: t('filters:any'), value: null },
    { label: t('filters:government'), value: true },
    { label: t('votes:tabs.nationalrat'), value: false },
  ] as const;
}

function activeMandateOptions(t: TFunction) {
  return [
    { label: t('filters:any'), value: null },
    { label: t('filters:yes'), value: true },
    { label: t('filters:no'), value: false },
  ] as const;
}

function mindPreviousPartyOptions(t: TFunction) {
  return [
    { label: t('filters:yes'), value: true },
    { label: t('filters:no'), value: false },
  ] as const;
}

type PeriodProps = {
  periods: LegisPeriod[];
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
  const { t } = useTranslation('filters');
  const country = useCountry();

  return (
    <BottomSheet
      visible={visible}
      title={t('genericTitle')}
      onClose={onClose}
      onReset={() =>
        onChange({ ...filters, accepted: null, voteType: null, simpleMajority: null })
      }>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <OptionGroup
          title={t('period')}
          options={periodOptions(periods, t)}
          value={filters.gp}
          onChange={(gp) => onChange({ ...filters, gp })}
        />
        {/* EU acceptance data isn't ready to surface yet */}
        {country === 'eu' ? null : (
          <OptionGroup
            title={t('accepted')}
            options={acceptedOptions(t)}
            value={filters.accepted}
            onChange={(accepted) => onChange({ ...filters, accepted })}
          />
        )}
        <OptionGroup
          title={t('voteType')}
          options={voteTypeOptions(t)}
          value={filters.voteType}
          onChange={(voteType) => onChange({ ...filters, voteType })}
        />
        <OptionGroup
          title={t('requiredMajority')}
          options={majorityOptions(t)}
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
  const { t } = useTranslation('filters');

  return (
    <BottomSheet
      visible={visible}
      title={t('genericTitle')}
      onClose={onClose}
      onReset={() => onChange({ ...filters, hasVoteResult: null })}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <OptionGroup
          title={t('period')}
          options={periodOptions(periods, t)}
          value={filters.gp}
          onChange={(gp) => onChange({ ...filters, gp })}
        />
        <OptionGroup
          title={t('voteStatus')}
          options={hasVoteResultOptions(t)}
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

export function DelegateGenericSheet({
  visible,
  periods,
  filters,
  onChange,
  onClose,
}: DelegateProps) {
  const { t } = useTranslation('filters');
  const country = useCountry();

  return (
    <BottomSheet
      visible={visible}
      title={t('genericTitle')}
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
          title={t('period')}
          options={periodOptions(periods, t)}
          value={filters.gp}
          onChange={(gp) => onChange({ ...filters, gp })}
        />
        {country === 'eu' ? null : (
          <OptionGroup
            title={t('mandateType')}
            options={mandateKindOptions(t)}
            value={filters.onlyGov}
            onChange={(onlyGov) => onChange({ ...filters, onlyGov })}
          />
        )}
        <OptionGroup
          title={t('activeMandate')}
          options={activeMandateOptions(t)}
          value={filters.hasActiveMandate}
          onChange={(hasActiveMandate) => onChange({ ...filters, hasActiveMandate })}
        />
        <OptionGroup
          title={t('considerFormerParty')}
          options={mindPreviousPartyOptions(t)}
          value={filters.mindPreviousPartyMembership}
          onChange={(mindPreviousPartyMembership) =>
            onChange({ ...filters, mindPreviousPartyMembership })
          }
        />
      </ScrollView>
    </BottomSheet>
  );
}

/** null is alle, which leaves out the gp parameter. periods arrives oldest first,
    so each period's end year is just the next period's start year minus one */
export function periodOptions(periods: LegisPeriod[], t: TFunction) {
  return [
    { label: t('filters:allPeriods'), value: null as string | null },
    ...periods.map((period, index) => {
      const startYear = new Date(period.start_date).getFullYear();
      const next = periods[index + 1];
      const label = next
        ? `${period.gp} (${startYear}–${new Date(next.start_date).getFullYear() - 1})`
        : t('filters:periodSince', { gp: period.gp, year: startYear });
      return { label, value: period.gp };
    }),
  ];
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
