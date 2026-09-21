import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/detail/section-card';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { isoToDotDate } from '@/lib/date';
import { somes } from '@/lib/somes';
import { useCountry } from '@/lib/use-country';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Absence, PlenarySession } from '@/types';

const PREVIEW = 3;

type Props = {
  absences: Absence[];
};

export function AbsencesCard({ absences }: Props) {
  const country = useCountry();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sittingLabel = country === 'eu' ? 'Plenarsitzung' : 'Nationalratssitzung';

  // absence.date is a plain calendar date, so it sorts and formats as a string
  const sorted = absences.slice().sort((a, b) => b.date.localeCompare(a.date));
  const shown = sorted.slice(0, PREVIEW);
  const { year, count } = headlineYear(sorted);

  return (
    <>
      <SectionCard title="Abwesenheiten">
        <Text style={[typography.subtitle, styles.sectionLabel]}>
          Verpasste Plenarsitzungen ({year}):
        </Text>
        <Text style={styles.count}>{count}</Text>

        {sorted.length === 0 ? (
          <Text style={typography.bodyMuted}>Keine Abwesenheiten</Text>
        ) : (
          <>
            <Text style={[typography.subtitle, styles.subheading]}>Zuletzt abwesend</Text>

            <View style={styles.list}>
              {shown.map((absence, index) => (
                // two absences can share a plenary_session_id, so use the position
                <View key={index} style={styles.row}>
                  <View style={styles.left}>
                    <View style={styles.dot} />
                    <Text style={[typography.subtitle, styles.sitting]} numberOfLines={1}>
                      {absence.inr}. {sittingLabel}
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
                onPress={() => setSheetOpen(true)}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={[typography.button, styles.buttonLabel]}>
                  Alle Abwesenheiten anzeigen ({sorted.length})
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </SectionCard>

      <AbsencesSheet
        visible={sheetOpen}
        absences={sorted}
        sittingLabel={sittingLabel}
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
  sittingLabel,
  onClose,
}: {
  visible: boolean;
  absences: Absence[];
  sittingLabel: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<SelectedSession | null>(null);

  // shared across every profile's sheet, sessions rarely change once recorded
  const sessions = useQuery({
    queryKey: ['plenary-sessions-per-gp'],
    queryFn: () => somes.reference.plenarySessionsPerGp(),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: visible,
  });

  // newest legislative period first, matches the flat preview list's own ordering
  const gps = [...new Set(absences.map((absence) => absence.gp))].sort().reverse();
  const absenceBySessionId = new Map(absences.map((absence) => [absence.plenary_session_id, absence]));

  return (
    <BottomSheet
      visible={visible}
      title="Abwesenheiten"
      onClose={() => {
        setSelected(null);
        onClose();
      }}
      applyLabel="Schließen">
      <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
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
                        ]}>
                        {session.inr}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text style={[typography.bodyMuted, styles.total]}>
          {absences.length} {absences.length === 1 ? 'Abwesenheit' : 'Abwesenheiten'} insgesamt
        </Text>

        {selected ? (
          <View style={styles.detail}>
            <View style={styles.detailHead}>
              <Text style={typography.cardHeading}>
                {selected.session.inr}. {sittingLabel} ({selected.gp})
              </Text>
              <Badge
                label={selected.absence ? 'Abwesend' : 'Anwesend'}
                color={selected.absence ? colors.dangerSurface : colors.inset}
                textColor={selected.absence ? colors.dangerSubtle : colors.textMuted}
              />
            </View>

            {selected.session.title ? (
              <Text style={typography.bodyMuted}>{selected.session.title}</Text>
            ) : null}

            {selected.absence ? (
              <Text style={typography.caption}>{isoToDotDate(selected.absence.date)}</Text>
            ) : null}

            {selected.absence?.source_url ? (
              <Pressable onPress={() => Linking.openURL(selected.absence!.source_url!)} hitSlop={8}>
                <Text style={[typography.subtitle, styles.link]}>Quellennachweis öffnen →</Text>
              </Pressable>
            ) : selected.session.absences_doc_url ? (
              <Pressable
                onPress={() => Linking.openURL(selected.session.absences_doc_url!)}
                hitSlop={8}>
                <Text style={[typography.subtitle, styles.link]}>Quellennachweis öffnen →</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
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
    width: 30,
    height: 30,
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
