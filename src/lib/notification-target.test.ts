import { parseNotificationTarget, targetHref } from '@/lib/notification-target';

describe('parseNotificationTarget', () => {
  it('reads a vote target', () => {
    expect(
      parseNotificationTarget({
        type: 'vote',
        country: 'at',
        gp: 'XXVIII',
        ityp: 'A',
        inr: 123,
        category: 'send_new_vote_result_by_favo',
      })
    ).toEqual({ type: 'vote', country: 'at', gp: 'XXVIII', ityp: 'A', inr: '123' });
  });

  it('reads a ministerial proposal target without an ityp', () => {
    expect(
      parseNotificationTarget({ type: 'ministerial_proposal', country: 'at', gp: 'XXVIII', inr: 44 })
    ).toEqual({ type: 'ministerial_proposal', country: 'at', gp: 'XXVIII', inr: '44' });
  });

  it('reads a decree target', () => {
    expect(
      parseNotificationTarget({ type: 'decree', country: 'at', ris_id: 'BGBLA_2025_II_1' })
    ).toEqual({ type: 'decree', country: 'at', risId: 'BGBLA_2025_II_1' });
  });

  it('reads a delegate target', () => {
    expect(parseNotificationTarget({ type: 'delegate', country: 'eu', id: 7 })).toEqual({
      type: 'delegate',
      country: 'eu',
      id: '7',
    });
  });

  it('takes an inr that is already a string', () => {
    const target = parseNotificationTarget({
      type: 'vote',
      country: 'eu',
      gp: '10',
      ityp: 'A',
      inr: '9',
    });

    expect(target).toEqual({ type: 'vote', country: 'eu', gp: '10', ityp: 'A', inr: '9' });
  });

  it('rejects a type this build does not know', () => {
    expect(parseNotificationTarget({ type: 'petition', country: 'at', id: 1 })).toBeNull();
  });

  it('rejects a target without a region, it cannot be resolved against an api', () => {
    expect(
      parseNotificationTarget({ type: 'vote', gp: 'XXVIII', ityp: 'A', inr: 123 })
    ).toBeNull();
    expect(
      parseNotificationTarget({ type: 'vote', country: 'de', gp: 'XXVIII', ityp: 'A', inr: 123 })
    ).toBeNull();
  });

  it('rejects a target that is missing a route param', () => {
    expect(parseNotificationTarget({ type: 'vote', country: 'at', gp: 'XXVIII', ityp: 'A' })).toBeNull();
    expect(parseNotificationTarget({ type: 'decree', country: 'at', ris_id: '' })).toBeNull();
    expect(parseNotificationTarget({ type: 'delegate', country: 'at', id: null })).toBeNull();
  });

  it('rejects a payload that is not an object', () => {
    expect(parseNotificationTarget(undefined)).toBeNull();
    expect(parseNotificationTarget(null)).toBeNull();
    expect(parseNotificationTarget('vote')).toBeNull();
    expect(parseNotificationTarget({})).toBeNull();
  });
});

describe('targetHref', () => {
  it('maps every target onto its route', () => {
    expect(targetHref({ type: 'vote', country: 'at', gp: 'XXVIII', ityp: 'A', inr: '123' })).toEqual({
      pathname: '/abstimmung/[gp]/[ityp]/[inr]',
      params: { gp: 'XXVIII', ityp: 'A', inr: '123' },
    });

    expect(
      targetHref({ type: 'ministerial_proposal', country: 'at', gp: 'XXVIII', inr: '44' })
    ).toEqual({ pathname: '/ministerialentwurf/[gp]/[inr]', params: { gp: 'XXVIII', inr: '44' } });

    expect(targetHref({ type: 'decree', country: 'at', risId: 'BGBLA_2025_II_1' })).toEqual({
      pathname: '/verordnung/[risId]',
      params: { risId: 'BGBLA_2025_II_1' },
    });

    expect(targetHref({ type: 'delegate', country: 'eu', id: '7' })).toEqual({
      pathname: '/abgeordnete/[id]',
      params: { id: '7' },
    });
  });
});
