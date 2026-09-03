import { useState } from 'react';

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
  const [tab, setTab] = useState<Tab>('nationalrat');

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
