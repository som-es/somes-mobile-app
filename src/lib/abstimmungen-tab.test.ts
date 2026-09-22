import { requestAbstimmungenTab, takeRequestedAbstimmungenTab } from '@/lib/abstimmungen-tab';

describe('abstimmungen-tab', () => {
  it('returns the requested tab once, then clears it', () => {
    requestAbstimmungenTab('regierung');

    expect(takeRequestedAbstimmungenTab()).toBe('regierung');
    expect(takeRequestedAbstimmungenTab()).toBeNull();
  });

  it('has nothing pending once nothing has been requested since the last take', () => {
    expect(takeRequestedAbstimmungenTab()).toBeNull();
  });
});
