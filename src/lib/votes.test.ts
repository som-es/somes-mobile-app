import { votePercent } from '@/lib/votes';
import type { NamedVoteInfo } from '@/types';

const info = (pro_count: number, given_vote_sum: number): NamedVoteInfo => ({
  id: 1,
  legis_init_id: 1,
  pro_count,
  contra_count: given_vote_sum - pro_count,
  given_vote_sum,
  invalid_count: 0,
});

describe('votePercent', () => {
  it('rounds the pro share to a whole percent', () => {
    expect(votePercent(info(2, 3))).toBe(67);
  });

  it('is null when no valid vote was cast', () => {
    expect(votePercent(info(0, 0))).toBeNull();
  });
});
