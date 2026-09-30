import type { DbSpeechAiSummary } from '@som-es/somes-ts';

export type SummaryLength = 'short' | 'normal' | 'long';

const FIELDS: Record<SummaryLength, keyof DbSpeechAiSummary> = {
  short: 'short_summary',
  normal: 'summary',
  long: 'very_detailed_summary',
};

/** the lengths the detail screen can offer, in short to long order. a length
    the backend hasn't generated (empty string) is left out rather than shown blank */
export function availableLengths(summary: DbSpeechAiSummary): SummaryLength[] {
  return (Object.keys(FIELDS) as SummaryLength[]).filter((length) => {
    const text = summary[FIELDS[length]];
    return typeof text === 'string' && text.length > 0;
  });
}

/** the text for the selected length, falling back to the first available one when
    the selection has nothing, null when no length has any text */
export function summaryText(summary: DbSpeechAiSummary, selected: SummaryLength): string | null {
  const available = availableLengths(summary);
  const length = available.includes(selected) ? selected : available[0];
  return length ? (summary[FIELDS[length]] as string) : null;
}
