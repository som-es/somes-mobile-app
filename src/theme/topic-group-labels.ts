import type { TFunction } from 'i18next';

/** topicGroup() in ./topic-groups returns one of a fixed set of canonical German
    group names — used as-is for matching/sorting/color lookup (topicColor keys
    off the same canonical string). Call this only where that name is actually
    rendered as text, translating it via common:topicGroups without touching the
    canonical value everything else keys off of. */
export function topicGroupLabel(t: TFunction, group: string): string {
  return t(`common:topicGroups.${group}`, { defaultValue: group });
}
