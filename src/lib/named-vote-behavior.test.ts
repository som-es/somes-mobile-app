import { votingBehaviorOf } from '@/lib/named-vote-behavior';

describe('votingBehaviorOf', () => {
  it('maps infavor:true to infavor', () => {
    expect(votingBehaviorOf({ infavor: true, was_absent: false })).toBe('infavor');
  });

  it('maps infavor:false to against', () => {
    expect(votingBehaviorOf({ infavor: false, was_absent: false })).toBe('against');
  });

  it('maps infavor:null, was_absent:true to absent', () => {
    expect(votingBehaviorOf({ infavor: null, was_absent: true })).toBe('absent');
  });

  it('maps infavor:null, was_absent:false to abstained', () => {
    expect(votingBehaviorOf({ infavor: null, was_absent: false })).toBe('abstained');
  });
});
