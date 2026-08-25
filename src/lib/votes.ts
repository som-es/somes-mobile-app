/**
 * Reading a party's position out of the per-member vote counts.
 *
 * The API used to hand over `fraction` (the party's seat count) and `infavor`
 * (did it vote yes) directly. It now sends the four counts instead, so those two
 * facts are derived — here and nowhere else, so the arithmetic lives in one
 * place rather than in every card that draws a vote.
 */
import type { Vote } from '@/types';

/** Members the party fielded on this vote — the old `fraction`. */
export function partySeats(vote: Vote): number {
  return (
    vote.infavor_count + vote.against_count + vote.abstention_count + vote.absence_count
  );
}

/**
 * Which way the party went — the old `infavor`.
 *
 * A simple majority of those who actually voted. Abstentions and absences are
 * counted for neither side, which is how the Nationalrat itself resolves them.
 * A tie reads as against: a motion needs a majority *for*, not merely no
 * majority against.
 */
export function partyInfavor(vote: Vote): boolean {
  return vote.infavor_count > vote.against_count;
}

/** Largest party first, as the vote lists have always been ordered. */
export function byPartySize(a: Vote, b: Vote): number {
  return partySeats(b) - partySeats(a);
}
