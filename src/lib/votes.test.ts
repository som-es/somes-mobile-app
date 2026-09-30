import { colors } from '@/theme/colors';
import { partySegments } from '@/lib/votes';

describe('partySegments', () => {
  it('lists the counts in vote bar order with the vote bar colours', () => {
    const segments = partySegments({
      party: 'X',
      code: 'X',
      infavor_count: 4,
      against_count: 3,
      abstention_count: 2,
      absence_count: 1,
    });

    expect(segments.map((segment) => segment.count)).toEqual([4, 3, 2, 1]);
    expect(segments.map((segment) => segment.color)).toEqual([
      colors.voteYes,
      colors.voteNo,
      colors.voteAbstain,
      colors.voteAbsent,
    ]);
  });
});
