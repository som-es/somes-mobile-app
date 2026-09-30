/* the api replaced fraction and infavor with four per member counts, both are
   derived here and nowhere else */
import { colors } from '@/theme/colors';
import type { Vote } from '@/types';

/** members the party fielded on this vote, the old fraction */
export function partySeats(vote: Vote): number {
  return (
    vote.infavor_count + vote.against_count + vote.abstention_count + vote.absence_count
  );
}

/** majority of those who actually voted, abstentions and absences count for neither
    side like the nationalrat resolves them, a tie reads as against */
export function partyInfavor(vote: Vote): boolean {
  return vote.infavor_count > vote.against_count;
}

/** largest party first, the order the vote lists have always used */
export function byPartySize(a: Vote, b: Vote): number {
  return partySeats(b) - partySeats(a);
}

export type VoteSegment = {
  key: 'infavor' | 'against' | 'abstained' | 'absent';
  count: number;
  color: string;
};

/** the four buckets of a party's vote in the order and colours the vote bar uses,
    shared so the overview donut and the bar can never drift apart */
export function partySegments(vote: Vote): VoteSegment[] {
  return [
    { key: 'infavor', count: vote.infavor_count, color: colors.voteYes },
    { key: 'against', count: vote.against_count, color: colors.voteNo },
    { key: 'abstained', count: vote.abstention_count, color: colors.voteAbstain },
    { key: 'absent', count: vote.absence_count, color: colors.voteAbsent },
  ];
}
