import { compareDelegates, toggleSort } from '@/lib/delegate-sort';
import type { Delegate } from '@/types';

type TestDelegate = Omit<Delegate, 'party' | 'birthdate'> & {
  party: string | null;
  birthdate: string | null;
};

function delegate(overrides: Partial<TestDelegate>): Delegate {
  return {
    id: 1,
    name: 'Zieht Vorne',
    party: null,
    birthdate: null,
    image_url: null,
    ...overrides,
  } as unknown as Delegate;
}

describe('toggleSort', () => {
  it('starts a new column ascending', () => {
    expect(toggleSort(null, 'name')).toEqual({ key: 'name', direction: 'asc' });
    expect(toggleSort({ key: 'alter', direction: 'desc' }, 'name')).toEqual({
      key: 'name',
      direction: 'asc',
    });
  });

  it('flips direction when the same column is pressed again', () => {
    expect(toggleSort({ key: 'name', direction: 'asc' }, 'name')).toEqual({
      key: 'name',
      direction: 'desc',
    });
    expect(toggleSort({ key: 'name', direction: 'desc' }, 'name')).toEqual({
      key: 'name',
      direction: 'asc',
    });
  });
});

describe('compareDelegates', () => {
  it('leaves the list untouched when there is no active sort', () => {
    const a = delegate({ id: 1, name: 'Bauer Clemens' });
    const b = delegate({ id: 2, name: 'Atzwanger Daniel' });

    expect([a, b].sort(compareDelegates(null))).toEqual([a, b]);
  });

  it('sorts by name, ascending or descending', () => {
    const a = delegate({ id: 1, name: 'Bauer Clemens' });
    const b = delegate({ id: 2, name: 'Atzwanger Daniel' });

    expect([a, b].sort(compareDelegates({ key: 'name', direction: 'asc' }))).toEqual([b, a]);
    expect([a, b].sort(compareDelegates({ key: 'name', direction: 'desc' }))).toEqual([a, b]);
  });

  it('sorts by party label, mapping missing/OK party to Ohne Klub', () => {
    const noParty = delegate({ id: 1, party: null });
    // 'FPÖ' unambiguously precedes 'Ohne Klub' — starts with F, not a diacritic
    // near the same letter, so this doesn't depend on locale collation rules
    const fpoe = delegate({ id: 2, party: 'FPÖ' });

    expect([noParty, fpoe].sort(compareDelegates({ key: 'partei', direction: 'asc' }))).toEqual([
      fpoe,
      noParty,
    ]);
  });

  it('sorts by age, pushing delegates with an unresolvable age to the end regardless of direction', () => {
    const currentYear = new Date().getFullYear();
    const older = delegate({ id: 1, birthdate: `${currentYear - 60}-01-01` });
    const younger = delegate({ id: 2, birthdate: `${currentYear - 30}-01-01` });
    const unknown = delegate({ id: 3, birthdate: null });

    expect(
      [unknown, older, younger].sort(compareDelegates({ key: 'alter', direction: 'asc' }))
    ).toEqual([younger, older, unknown]);

    expect(
      [unknown, older, younger].sort(compareDelegates({ key: 'alter', direction: 'desc' }))
    ).toEqual([older, younger, unknown]);
  });
});
