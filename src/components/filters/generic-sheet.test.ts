import { periodOptions } from '@/components/filters/generic-sheet';
import type { LegisPeriod } from '@/types';

describe('periodOptions', () => {
  it('leads with an unfiltered "Alle" option', () => {
    expect(periodOptions([]).at(0)).toEqual({ label: 'Alle', value: null });
  });

  it('labels each period with its year range, taken from the next period’s start date', () => {
    const periods: LegisPeriod[] = [
      { gp: 'XXVII', start_date: '2019-10-23' },
      { gp: 'XXVIII', start_date: '2024-10-23' },
    ];

    expect(periodOptions(periods).slice(1)).toEqual([
      { label: 'XXVII (2019–2023)', value: 'XXVII' },
      { label: 'XXVIII (seit 2024)', value: 'XXVIII' },
    ]);
  });
});
