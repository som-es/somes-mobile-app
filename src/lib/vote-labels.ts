import { isoToDotDate } from '@/lib/date';
import type { LegislativeInitiative } from '@/types';

/** VoteTypeBadge.svelte, verbatim. */
const VOTE_TYPE: Record<string, string> = {
  Law: 'Gesetz',
  Amendment: 'Abänderung',
  Resolution: 'Entschließung',
  Report: 'Bericht',
};

/**
 * An unknown `voting` yields '' rather than 'Andere' — the web only labels the
 * null case, and shows nothing for a type it does not recognise.
 */
export function voteTypeLabel(voting: string | null): string {
  if (!voting) return 'Andere';
  return VOTE_TYPE[voting] ?? '';
}

/** The four peach badges under a vote, in the Figma's order. */
export function voteBadges(initiative: LegislativeInitiative): string[] {
  const type = voteTypeLabel(initiative.voting);
  return [
    initiative.requires_simple_majority ? 'einfache Mehrheit' : '2/3 Mehrheit',
    initiative.gp,
    isoToDotDate(initiative.nr_plenary_activity_date),
    ...(type ? [type] : []),
  ];
}
