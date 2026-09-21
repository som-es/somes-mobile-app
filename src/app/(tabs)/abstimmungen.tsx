import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ProposalsList } from '@/components/lists/proposals-list';
import { VotesList } from '@/components/lists/votes-list';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { takeRequestedAbstimmungenTab, type AbstimmungenTab } from '@/lib/abstimmungen-tab';
import { useCountry } from '@/lib/use-country';

const TABS: { value: AbstimmungenTab; label: string }[] = [
  { value: 'nationalrat', label: 'Nationalrat' },
  { value: 'regierung', label: 'Regierung' },
];

export default function AbstimmungenScreen() {
  const country = useCountry();
  const [tab, setTab] = useState<AbstimmungenTab>('nationalrat');

  // fires on every focus, not just the first mount, so a caller's requested
  // segment lands even if this tab was already open from an earlier visit
  useFocusEffect(
    useCallback(() => {
      const requested = takeRequestedAbstimmungenTab();
      if (requested) setTab(requested);
    }, [])
  );

  // MEPs have no government concept, so the second tab does not exist for EU
  if (country === 'eu') {
    return <VotesList key={country} control={null} />;
  }

  const control = <SegmentedControl options={TABS} value={tab} onChange={setTab} />;

  return tab === 'nationalrat' ? (
    <VotesList key={country} control={control} />
  ) : (
    <ProposalsList key={country} control={control} />
  );
}
