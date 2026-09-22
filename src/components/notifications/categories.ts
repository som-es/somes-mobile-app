/* NotificationSettings and MailSendInfo carry the same nine categories, the mail field
   is the push field plus a _mails suffix, so one table labels both cards */
import { useTranslation } from 'react-i18next';

import type { MailSendInfo, NotificationSettings } from '@/types';

export type CategoryKey = Exclude<keyof NotificationSettings, 'platform'>;

const CATEGORY_KEYS: CategoryKey[] = [
  'send_new_vote_results',
  'send_new_vote_result_by_favo',
  'send_new_delegate_activity',
  'send_new_ministrial_prop',
  'send_new_ministrial_prop_by_favo',
  'send_new_decree',
  'send_new_decree_by_favo',
  'send_new_proposal',
  'send_new_proposal_by_favo',
];

/** both cards fail the same way and both sit on a pull to refresh screen, so the one
    string names the retry that is actually there */
export function useLoadError(): string {
  const { t } = useTranslation('notifications');
  return t('loadError');
}

export function useCategories(): { key: CategoryKey; label: string; description: string }[] {
  const { t } = useTranslation('notifications');
  return CATEGORY_KEYS.map((key) => ({
    key,
    label: t(`categories.${key}.label`),
    description: t(`categories.${key}.description`),
  }));
}

/** the mail record spells the same categories with a suffix */
export function mailKey(key: CategoryKey): keyof MailSendInfo {
  return `${key}_mails` as keyof MailSendInfo;
}
