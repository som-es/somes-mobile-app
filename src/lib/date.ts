/* The API returns bare dates ("2026-03-26") and naive datetimes ("2026-04-23T09:00:00"). */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** "2026-03-26" → "26.03.2026". */
export function dashDateToDotDate(date: string): string {
  const parts = date.split('-');
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

export function isoToDotDate(date: string): string {
  return dashDateToDotDate(date.split('T')[0]);
}

export function relativeDayLabel(date: string): string | null {
  const days = (new Date(date).getTime() - Date.now()) / MS_PER_DAY;
  if (Number.isNaN(days) || days <= 0) return null;

  if (days < 1) {
    const hours = Math.round(days * 24);
    return hours <= 1 ? 'in 1 Stunde' : `in ${hours} Stunden`;
  }

  const rounded = Math.round(days);
  return rounded === 1 ? 'in 1 Tag' : `in ${rounded} Tagen`;
}

/** Calendar age, or null. Compares calendar fields — dividing days by 365 drifts. */
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

/** A speech length. Under a minute still reads as "1 Min." rather than "0 Min.". */
export function minutes(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} Min.`;
}
