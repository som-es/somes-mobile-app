import type { TFunction } from 'i18next';

import { isoToDotDate } from '@/lib/date';
import type { Locale } from '@/lib/locale';
import type { LegislativeInitiative } from '@/types';

/** same labels as the web */
const VOTE_TYPE_KEY: Record<string, string> = {
  Law: 'voteType.law',
  Amendment: 'voteType.amendment',
  Resolution: 'voteType.resolution',
  Report: 'voteType.report',
};

/** an unknown voting yields '' rather than andere, like on the web */
export function voteTypeLabel(t: TFunction, voting: string | null): string {
  if (!voting) return t('votes:voteType.other');
  const key = VOTE_TYPE_KEY[voting];
  return key ? t(`votes:${key}`) : '';
}

export function voteBadges(t: TFunction, locale: Locale, initiative: LegislativeInitiative): string[] {
  const type = voteTypeLabel(t, initiative.voting);
  return [
    initiative.requires_simple_majority ? t('votes:majority.simple') : t('votes:majority.twoThirds'),
    initiative.gp,
    isoToDotDate(initiative.nr_plenary_activity_date, locale),
    ...(type ? [type] : []),
  ];
}
