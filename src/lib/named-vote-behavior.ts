import type { TFunction } from 'i18next';

export type VotingBehavior = 'infavor' | 'against' | 'abstained' | 'absent';

export const VOTING_BEHAVIOR_VALUES: VotingBehavior[] = [
  'infavor',
  'against',
  'abstained',
  'absent',
];

/** call with a `t` from useTranslation() — behaviorLabel(t, 'infavor') reads
    common:votingBehavior.infavor, translated in the caller's active locale */
export function behaviorLabel(t: TFunction, behavior: VotingBehavior): string {
  return t(`common:votingBehavior.${behavior}`);
}

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
