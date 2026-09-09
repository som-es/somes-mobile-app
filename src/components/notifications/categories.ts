/* NotificationSettings and MailSendInfo carry the same nine categories, the mail field
   is the push field plus a _mails suffix, so one table labels both cards */
import type { MailSendInfo, NotificationSettings } from '@/types';

export type CategoryKey = Exclude<keyof NotificationSettings, 'platform'>;

/** both cards fail the same way and both sit on a pull to refresh screen, so the one
    string names the retry that is actually there */
export const LOAD_ERROR =
  'Einstellungen konnten nicht geladen werden. Zieh die Seite nach unten, um es erneut zu versuchen.';

export const CATEGORIES: { key: CategoryKey; label: string; description: string }[] = [
  {
    key: 'send_new_vote_results',
    label: 'Neue Abstimmungsergebnisse',
    description: 'Jedes neue Ergebnis, unabhängig von deinen Favoriten.',
  },
  {
    key: 'send_new_vote_result_by_favo',
    label: 'Favorisierte Abstimmungen',
    description: 'Nur Ergebnisse zu Abstimmungen in deinen Favoriten.',
  },
  {
    key: 'send_new_delegate_activity',
    label: 'Aktivität favorisierter Abgeordneter',
    description: 'Reden, Anfragen und Abstimmungen deiner Favoriten.',
  },
  {
    key: 'send_new_ministrial_prop',
    label: 'Neue Ministerialentwürfe',
    description: 'Jeder neue Entwurf, unabhängig von deinen Interessen.',
  },
  {
    key: 'send_new_ministrial_prop_by_favo',
    label: 'Ministerialentwürfe zu deinen Interessen',
    description: 'Nur Entwürfe, die zu deinen Interessen passen.',
  },
  {
    key: 'send_new_decree',
    label: 'Neue Verordnungen',
    description: 'Jede neue Verordnung, unabhängig von deinen Interessen.',
  },
  {
    key: 'send_new_decree_by_favo',
    label: 'Verordnungen zu deinen Interessen',
    description: 'Nur Verordnungen, die zu deinen Interessen passen.',
  },
  {
    key: 'send_new_proposal',
    label: 'Neue Anträge',
    description: 'Jeder neue Antrag, unabhängig von deinen Interessen.',
  },
  {
    key: 'send_new_proposal_by_favo',
    label: 'Anträge zu deinen Interessen',
    description: 'Nur Anträge, die zu deinen Interessen passen.',
  },
];

/** the mail record spells the same categories with a suffix */
export function mailKey(key: CategoryKey): keyof MailSendInfo {
  return `${key}_mails` as keyof MailSendInfo;
}
