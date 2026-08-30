import { isoToDotDate } from '@/lib/date';
import type { LegislativeInitiative } from '@/types';

/** same labels as the web */
const VOTE_TYPE: Record<string, string> = {
  Law: 'Gesetz',
  Amendment: 'Abänderung',
  Resolution: 'Entschließung',
  Report: 'Bericht',
};

/** an unknown voting yields '' rather than andere, like on the web */
export function voteTypeLabel(voting: string | null): string {
  if (!voting) return 'Andere';
  return VOTE_TYPE[voting] ?? '';
}

export function voteBadges(initiative: LegislativeInitiative): string[] {
  const type = voteTypeLabel(initiative.voting);
  return [
    initiative.requires_simple_majority ? 'einfache Mehrheit' : '2/3 Mehrheit',
    initiative.gp,
    isoToDotDate(initiative.nr_plenary_activity_date),
    ...(type ? [type] : []),
  ];
}
