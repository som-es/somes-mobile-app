import { useState } from 'react';

import { ProposalsList } from '@/components/lists/proposals-list';
import { VotesList } from '@/components/lists/votes-list';
import { SegmentedControl } from '@/components/ui/segmented-control';

const TABS = [
  { value: 'nationalrat', label: 'Nationalrat' },
  { value: 'regierung', label: 'Regierung' },
] as const;

type Tab = (typeof TABS)[number]['value'];

export default function AbstimmungenScreen() {
  const [tab, setTab] = useState<Tab>('nationalrat');

  const control = <SegmentedControl options={TABS} value={tab} onChange={setTab} />;

  return tab === 'nationalrat' ? (
    <VotesList control={control} />
  ) : (
    <ProposalsList control={control} />
  );
}
