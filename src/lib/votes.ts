/* The API replaced `fraction` and `infavor` with four per-member counts. Both facts are
   derived here and nowhere else. */
import type { Vote } from '@/types';

/** Members the party fielded on this vote — the old `fraction`. */
export function partySeats(vote: Vote): number {
  return (
    vote.infavor_count + vote.against_count + vote.abstention_count + vote.absence_count
  );
}

/** Majority of those who actually voted — abstentions and absences count for neither
    side, as the Nationalrat resolves them. A tie reads as against. */
export function partyInfavor(vote: Vote): boolean {
  return vote.infavor_count > vote.against_count;
}

/** Largest party first, as the vote lists have always been ordered. */
export function byPartySize(a: Vote, b: Vote): number {
  return partySeats(b) - partySeats(a);
}
