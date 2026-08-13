import { useState } from 'react';

import { ProposalsList } from '@/components/lists/proposals-list';
import { VotesList } from '@/components/lists/votes-list';
import { SegmentedControl } from '@/components/ui/segmented-control';

const TABS = [
  { value: 'nationalrat', label: 'Nationalrat' },
  { value: 'regierung', label: 'Regierung' },
] as const;

type Tab = (typeof TABS)[number]['value'];

/**
 * Figma node 286:276. Two lists behind one segmented control:
 *  - Nationalrat → vote results, somes.at `/history/votes`
 *  - Regierung   → ministerial proposals, somes.at `/history/proposals`
 *
 * The control is handed to whichever list is showing rather than sitting above
 * them, because the design has it scroll away with the rest of the header.
 * Each list keeps its own search text and filters, so switching back and forth
 * does not clear either.
 */
export default function AbstimmungenScreen() {
  const [tab, setTab] = useState<Tab>('nationalrat');

  const control = <SegmentedControl options={TABS} value={tab} onChange={setTab} />;

  return tab === 'nationalrat' ? (
    <VotesList control={control} />
  ) : (
    <ProposalsList control={control} />
  );
}
