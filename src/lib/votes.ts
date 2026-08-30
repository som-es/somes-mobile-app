/* the api replaced fraction and infavor with four per member counts, both are
   derived here and nowhere else */
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
