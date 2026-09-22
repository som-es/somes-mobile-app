export type VotingBehavior = 'infavor' | 'against' | 'abstained' | 'absent';

export const VOTING_BEHAVIOR_OPTIONS: { value: VotingBehavior; label: string }[] = [
  { value: 'infavor', label: 'Dafür' },
  { value: 'against', label: 'Dagegen' },
  { value: 'abstained', label: 'Enthalten' },
  { value: 'absent', label: 'Nicht abgestimmt' },
];

export const BEHAVIOR_LABEL = new Map(
  VOTING_BEHAVIOR_OPTIONS.map((option) => [option.value, option.label])
);

/** infavor/was_absent cleanly cover three states (dafür/dagegen/abwesend); the
    fourth EU state (enthalten) is inferred as null+not-absent — unverified
    against real EU roll-call data, confirm and fix here once available */
export function votingBehaviorOf(vote: {
  infavor: boolean | null;
  was_absent: boolean | null;
}): VotingBehavior {
  if (vote.infavor === true) return 'infavor';
  if (vote.infavor === false) return 'against';
  return vote.was_absent ? 'absent' : 'abstained';
}
