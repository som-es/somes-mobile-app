import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/detail/section-card';
import { isoToDotDate } from '@/lib/date';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Absence } from '@/types';

const PREVIEW = 3;

type Props = {
  absences: Absence[];
};

/**
 * "Abwesenheiten" — how many plenary sittings the member missed, and which.
 *
 * The design labels the headline number with the current year. Most members
 * have missed nothing this year, which left a large "0" saying nothing at all,
 * so the year falls back to the most recent one that has absences and is
 * labelled accordingly. The shape stays the design's: a year, then the count.
 *
 * The Figma's coral "Alle Abwesenheiten anzeigen" button opens a modal on the
 * web; here it expands the list in place.
 */
export function AbsencesCard({ absences }: Props) {
  const [expanded, setExpanded] = useState(false);

  // `Absence.date` is a plain "2024-07-05" calendar date, so it sorts and
  // formats as a string — no timezone conversion to get wrong.
  const sorted = absences
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const shown = expanded ? sorted : sorted.slice(0, PREVIEW);
  const { year, count } = headlineYear(sorted);

  return (
    <SectionCard title="Abwesenheiten">
      <Text style={typography.caption}>Verpasste Plenarsitzungen ({year}):</Text>
      <Text style={styles.count}>{count}</Text>

      {sorted.length === 0 ? (
        <Text style={typography.bodyMuted}>Keine Abwesenheiten</Text>
      ) : (
        <>
          <Text style={[typography.subtitle, styles.subheading]}>Zuletzt abwesend</Text>

          <View style={styles.list}>
            {shown.map((absence, index) => (
              // Two absences can share a plenary_session_id, so position it is.
              <View key={index} style={styles.row}>
                <View style={styles.left}>
                  <View style={styles.dot} />
                  <Text style={[typography.subtitle, styles.sitting]} numberOfLines={1}>
                    {absence.inr}. Nationalratssitzung
                  </Text>
                </View>
                <Text style={typography.caption}>
                  {isoToDotDate(absence.date)} ({absence.gp})
                </Text>
              </View>
            ))}
          </View>

          {sorted.length > PREVIEW ? (
            <Pressable
              onPress={() => setExpanded(!expanded)}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={[typography.button, styles.buttonLabel]}>
                {expanded
                  ? 'Weniger anzeigen'
                  : `Alle Abwesenheiten anzeigen (${sorted.length})`}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}

/**
 * The current year when it has absences, otherwise the most recent year that
 * does — so the headline never reads "0" while the list below shows three.
 */
function headlineYear(sorted: Absence[]): { year: number; count: number } {
  const current = new Date().getFullYear();
  const years = sorted.map((absence) => Number(absence.date.slice(0, 4)));

  const year = years.includes(current) ? current : (years[0] ?? current);
  return { year, count: years.filter((value) => value === year).length };
}

const styles = StyleSheet.create({
  count: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textMuted,
  },
  subheading: {
    marginTop: spacing.md,
    fontWeight: '600',
  },
  list: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.inset,
    borderRadius: radius.track,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
  },
  sitting: {
    fontWeight: '600',
    flexShrink: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.danger,
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
  },
  buttonLabel: {
    color: colors.onAccent,
  },
  pressed: {
    opacity: 0.8,
  },
});
