import type { DbSpeechAiSummary } from '@som-es/somes-ts';

import { availableLengths, summaryText } from '@/lib/speech-summary';

const summary = (overrides: Partial<DbSpeechAiSummary>) =>
  ({
    short_summary: 'kurz',
    summary: 'normal',
    very_detailed_summary: 'lang',
    ...overrides,
  }) as DbSpeechAiSummary;

describe('availableLengths', () => {
  it('lists short, normal, long in that order', () => {
    expect(availableLengths(summary({}))).toEqual(['short', 'normal', 'long']);
  });

  it('skips lengths without text', () => {
    expect(availableLengths(summary({ very_detailed_summary: '' }))).toEqual(['short', 'normal']);
  });
});

describe('summaryText', () => {
  it('returns the selected length', () => {
    expect(summaryText(summary({}), 'long')).toBe('lang');
  });

  it('falls back to the first available length', () => {
    expect(summaryText(summary({ summary: '' }), 'normal')).toBe('kurz');
  });

  it('is null when nothing was generated', () => {
    expect(
      summaryText(summary({ short_summary: '', summary: '', very_detailed_summary: '' }), 'normal')
    ).toBeNull();
  });
});
