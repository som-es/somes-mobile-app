import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { ProposalsList } from '@/components/lists/proposals-list';
import { VotesList } from '@/components/lists/votes-list';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useCountry } from '@/lib/use-country';

const TABS = [
  { value: 'nationalrat', label: 'Nationalrat' },
  { value: 'regierung', label: 'Regierung' },
] as const;

type Tab = (typeof TABS)[number]['value'];

export default function AbstimmungenScreen() {
  const country = useCountry();
  // a caller (e.g. Home's "Weitere ..." links) can request a starting segment;
  // the effect below also re-applies it on a later navigation, since this tab
  // screen stays mounted across tab switches and a fresh useState wouldn't rerun
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'regierung' ? 'regierung' : 'nationalrat');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the segment to an external param change, same as bottom-sheet.tsx's mounted flag
    if (params.tab === 'nationalrat' || params.tab === 'regierung') setTab(params.tab);
  }, [params.tab]);

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
