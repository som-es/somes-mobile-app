import i18n from '@/i18n';
import { voteBadges, voteTypeLabel } from '@/lib/vote-labels';
import type { LegislativeInitiative } from '@/types';

const t = i18n.getFixedT('de-AT');

describe('voteTypeLabel', () => {
  it('maps every known voting type to its German label', () => {
    expect(voteTypeLabel(t, 'Law')).toBe('Gesetz');
    expect(voteTypeLabel(t, 'Amendment')).toBe('Abänderung');
    expect(voteTypeLabel(t, 'Resolution')).toBe('Entschließung');
    expect(voteTypeLabel(t, 'Report')).toBe('Bericht');
  });

  it('returns "Andere" for null', () => {
    expect(voteTypeLabel(t, null)).toBe('Andere');
  });

  it('returns an empty string for an unknown voting type, not "Andere"', () => {
    expect(voteTypeLabel(t, 'SomethingElse')).toBe('');
  });
});

describe('voteBadges', () => {
  const base: LegislativeInitiative = {
    gp: 'XXVIII',
    requires_simple_majority: true,
    nr_plenary_activity_date: '2024-03-07T12:00:00Z',
    voting: 'Law',
  } as LegislativeInitiative;

  it('includes the type label when it resolves to a non-empty string', () => {
    expect(voteBadges(t, 'de-AT', base)).toEqual(['einfache Mehrheit', 'XXVIII', '07.03.2024', 'Gesetz']);
  });

  it('omits the type label when it resolves to an empty string', () => {
    const badges = voteBadges(t, 'de-AT', { ...base, voting: 'SomethingElse' });
    expect(badges).toEqual(['einfache Mehrheit', 'XXVIII', '07.03.2024']);
  });

  it('reads "2/3 Mehrheit" when a simple majority is not required', () => {
    const badges = voteBadges(t, 'de-AT', { ...base, requires_simple_majority: false });
    expect(badges[0]).toBe('2/3 Mehrheit');
  });
});
