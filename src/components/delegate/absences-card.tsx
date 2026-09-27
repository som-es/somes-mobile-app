import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SectionCard } from '@/components/detail/section-card';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { dashDateToDotDate, dashDateToShortDate, inrEncodedDate, isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { useLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Absence, LegisPeriod, PlenarySession } from '@/types';

const PREVIEW = 3;

type Props = {
  absences: Absence[];
};

export function AbsencesCard({ absences }: Props) {
  const { t } = useTranslation('delegates');
  const locale = useLocale();
  const country = useCountry();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sittingLabel = country === 'eu' ? t('absences.sittingEu') : t('absences.sittingAt');
  // AT's inr is a small sequential sitting number ("50. Sitzung"), but EU's is
  // an encoded YYYYMMDD date, which reads as a date rather than an ordinal
  const sittingHeadline = (inr: number) =>
    country === 'eu'
      ? `${dashDateToDotDate(inrEncodedDate(inr), locale)} · ${sittingLabel}`
      : `${inr}. ${sittingLabel}`;

  // absence.date is a plain calendar date, so it sorts and formats as a string
  const sorted = absences.slice().sort((a, b) => b.date.localeCompare(a.date));
  const shown = sorted.slice(0, PREVIEW);
  const { year, count } = headlineYear(sorted);

  return (
    <>
      <SectionCard title={t('absences.title')}>
        <Text style={[typography.subtitle, styles.sectionLabel]}>
          {t('absences.missedSessions', { year })}
        </Text>
        <Text style={styles.count}>{count}</Text>

        {sorted.length === 0 ? (
          <Text style={typography.bodyMuted}>{t('absences.none')}</Text>
        ) : (
          <>
            <Text style={[typography.subtitle, styles.subheading]}>{t('absences.lastAbsent')}</Text>

            <View style={styles.list}>
              {shown.map((absence, index) => (
                // two absences can share a plenary_session_id, so use the position
                <View key={index} style={styles.row}>
                  <View style={styles.left}>
                    <View style={styles.dot} />
                    <Text style={[typography.subtitle, styles.sitting]} numberOfLines={1}>
                      {sittingHeadline(absence.inr)}
                    </Text>
                  </View>
                  <Text style={typography.caption}>
                    {isoToDotDate(absence.date, locale)} ({absence.gp})
                  </Text>
                </View>
              ))}
            </View>

            {sorted.length > PREVIEW ? (
              <Pressable
                onPress={() => setSheetOpen(true)}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={[typography.button, styles.buttonLabel]}>
                  {t('absences.showAll', { count: sorted.length })}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </SectionCard>

      <AbsencesSheet
        visible={sheetOpen}
        absences={sorted}
        sittingHeadline={sittingHeadline}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

type SelectedSession = {
  gp: string;
  session: PlenarySession;
  absence: Absence | null;
};

function AbsencesSheet({
  visible,
  absences,
  sittingHeadline,
  onClose,
}: {
  visible: boolean;
  absences: Absence[];
  sittingHeadline: (inr: number) => string;
  onClose: () => void;
}) {
  const { t } = useTranslation('delegates');
  const locale = useLocale();
  const country = useCountry();
  const [selected, setSelected] = useState<SelectedSession | null>(null);
  const { height: windowHeight } = useWindowDimensions();
  const scrollMaxHeight = Math.min(340, windowHeight * 0.35);
  // AT's grid shows the plain sitting number; EU's inr has no small ordinal to
  // show, so the square shows a short day/month instead
  const gridLabel = (inr: number) =>
    country === 'eu' ? dashDateToShortDate(inrEncodedDate(inr), locale) : String(inr);

  // shared across every profile's sheet, sessions rarely change once recorded
  const sessions = useQuery({
    queryKey: ['plenary-sessions-per-gp'],
    queryFn: () => somes.reference.plenarySessionsPerGp(),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: visible,
  });

  // same cache useFilterSources() populates, reused here for a hit rather than a
  // second request — AT's roman numerals happen to sort right as plain strings,
  // but EU's numeric gp ids ("9" vs "10") don't, so real start dates are needed
  const periods = useQuery({
    queryKey: ['all-gps'],
    queryFn: () => somes.reference.legisPeriods(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const gps = sortGpsByStartDate(
    [...new Set(absences.map((absence) => absence.gp))],
    periods.data ?? []
  );
  const absenceBySessionId = new Map(absences.map((absence) => [absence.plenary_session_id, absence]));

  // absences is already sorted newest-first by the parent AbsencesCard, so the
  // first entry is the one to preselect once the sheet's sessions are in
  useEffect(() => {
    if (!visible || selected !== null || absences.length === 0 || !sessions.data) return;

    const mostRecent = absences[0];
    const session = (sessions.data[mostRecent.gp] ?? []).find(
      (candidate) => candidate.id === mostRecent.plenary_session_id
    );
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preselects the newest absence once its session is available, not a response to a user action
      setSelected({ gp: mostRecent.gp, session, absence: mostRecent });
    }
  }, [visible, absences, sessions.data, selected]);

  return (
    <BottomSheet
      visible={visible}
      title={t('absences.title')}
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      applyLabel={t('absences.close')}>
      <View style={styles.sheetRoot}>
        <ScrollView
          style={[styles.sheetScroll, { maxHeight: scrollMaxHeight }]}
          contentContainerStyle={styles.sheetBody}
          showsVerticalScrollIndicator={false}>
          {gps.map((gp) => {
            const gpSessions = (sessions.data?.[gp] ?? []).slice().sort((a, b) => a.inr - b.inr);
            if (gpSessions.length === 0) return null;

            return (
              <View key={gp} style={styles.gpGroup}>
                <Text style={typography.cardHeading}>{gp}</Text>
                <View style={styles.grid}>
                  {gpSessions.map((session) => {
                    const absence = absenceBySessionId.get(session.id) ?? null;
                    const isSelected = selected?.session.id === session.id;
                    return (
                      <Pressable
                        key={session.id}
                        onPress={() => setSelected({ gp, session, absence })}
                        style={[
                          styles.square,
                          absence ? styles.squareAbsent : styles.squarePresent,
                          isSelected && styles.squareSelected,
                        ]}>
                        <Text
                          style={[
                            typography.caption,
                            absence ? styles.squareTextAbsent : styles.squareTextPresent,
                          ]}
                          numberOfLines={1}>
                          {gridLabel(session.inr)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <Text style={[typography.bodyMuted, styles.total]}>
            {t('absences.totalCount', { count: absences.length })}
          </Text>
        </ScrollView>

        {/* a sibling of the ScrollView rather than its last child, so pressing a
            square in a long grid can never push this out of the visible area */}
        {selected ? (
          <View style={styles.detail}>
            <View style={styles.detailHead}>
              <Text style={typography.cardHeading}>
                {sittingHeadline(selected.session.inr)} ({selected.gp})
              </Text>
              <Badge
                label={selected.absence ? t('absences.absent') : t('absences.present')}
                color={selected.absence ? colors.dangerSurface : colors.inset}
                textColor={selected.absence ? colors.dangerSubtle : colors.textMuted}
              />
            </View>

            {selected.session.title ? (
              <Text style={typography.bodyMuted}>{selected.session.title}</Text>
            ) : null}

            {selected.absence ? (
              <Text style={typography.caption}>{isoToDotDate(selected.absence.date, locale)}</Text>
            ) : null}

            {selected.absence?.source_url ? (
              <Pressable onPress={() => Linking.openURL(selected.absence!.source_url!)} hitSlop={8}>
                <Text style={[typography.subtitle, styles.link]}>{t('absences.openSource')}</Text>
              </Pressable>
            ) : selected.session.absences_doc_url ? (
              <Pressable
                onPress={() => Linking.openURL(selected.session.absences_doc_url!)}
                hitSlop={8}>
                <Text style={[typography.subtitle, styles.link]}>{t('absences.openSource')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
}

/** newest first; falls back to a plain string compare only when a gp is missing
    from the legislative-periods list (AT's roman numerals happen to sort right
    that way, but EU's numeric ids, e.g. "9" vs "10", do not) */
function sortGpsByStartDate(gps: string[], periods: LegisPeriod[]): string[] {
  const startDateByGp = new Map(periods.map((period) => [period.gp, period.start_date]));

  return gps.slice().sort((a, b) => {
    const aDate = startDateByGp.get(a);
    const bDate = startDateByGp.get(b);
    return aDate && bDate ? bDate.localeCompare(aDate) : b.localeCompare(a);
  });
}

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
  sectionLabel: {
    fontWeight: '600',
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
  sheetRoot: {
    gap: spacing.md,
  },
  sheetScroll: {},
  sheetBody: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  gpGroup: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  square: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.thumb,
  },
  squarePresent: {
    backgroundColor: colors.inset,
  },
  squareAbsent: {
    backgroundColor: colors.dangerSurface,
  },
  squareSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  squareTextPresent: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  squareTextAbsent: {
    color: colors.dangerSubtle,
    fontWeight: '700',
  },
  total: {
    textAlign: 'right',
  },
  detail: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.inset,
    borderRadius: radius.track,
  },
  detailHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  link: {
    color: colors.accent,
  },
});
