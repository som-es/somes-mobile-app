/* the api returns bare dates and datetimes without a timezone, both are handled here */
import i18n from '@/i18n';
import type { Locale } from '@/lib/locale';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** parses the Y/M/D components directly rather than `new Date(dateString)`,
    which the caller's device timezone could otherwise shift by a day */
function utcDateFromDashDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const dotDateFormatters: Partial<Record<Locale, Intl.DateTimeFormat>> = {};

function dotDateFormatter(locale: Locale): Intl.DateTimeFormat {
  return (dotDateFormatters[locale] ??= new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }));
}

export function dashDateToDotDate(date: string, locale: Locale): string {
  return dotDateFormatter(locale).format(utcDateFromDashDate(date));
}

export function isoToDotDate(date: string, locale: Locale): string {
  return dashDateToDotDate(date.split('T')[0], locale);
}

/** Intl.RelativeTimeFormat isn't available in every Hermes build this app ships on
    (DateTimeFormat is, RelativeTimeFormat/PluralRules often aren't), so this goes
    through i18next's own pluralization instead of the Intl constructor */
export function relativeDayLabel(date: string, locale: Locale): string | null {
  const days = (new Date(date).getTime() - Date.now()) / MS_PER_DAY;
  if (Number.isNaN(days) || days <= 0) return null;

  const t = i18n.getFixedT(locale, 'common');

  if (days < 1) {
    const hours = Math.round(days * 24);
    return t('relative.inHours', { count: Math.max(1, hours) });
  }

  return t('relative.inDays', { count: Math.round(days) });
}

/** calendar age, or null, compares calendar fields since dividing days by 365 drifts */
export function age(birthdate: string | null): number | null {
  if (!birthdate) return null;

  const born = new Date(birthdate);
  if (Number.isNaN(born.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();

  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) years -= 1;

  return years >= 0 ? years : null;
}

/** a speech length, under a minute still reads as 1 min rather than 0 min */
export function minutes(seconds: number, locale: Locale): string {
  const count = Math.max(1, Math.round(seconds / 60));
  return i18n.getFixedT(locale, 'common')('duration.minutes', { count });
}
