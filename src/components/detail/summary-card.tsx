import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VoteMark } from '@/components/ui/vote-mark';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

import { Divider } from './section-card';

type Props = {
  title: string;
  /** "Abstimmung am: 02.12.2025" or "Ministerialentwurf vom 02.08.2026". */
  subtitle: string;
  /** Omitted entirely when the record has no AI summary. */
  summary: string | null;
  badges: string[];
  /** The tick / cross beside the title. Absent when the vote has no outcome. */
  accepted?: boolean | null;
};

/** The first card of both detail screens — Figma node 231:2844, top block. */
export function SummaryCard({ title, subtitle, summary, badges, accepted = null }: Props) {
  return (
    <Card>
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={typography.detailTitle}>{title}</Text>
          <Text style={typography.caption}>{subtitle}</Text>
        </View>
        {accepted !== null ? <VoteMark infavor={accepted} size={24} /> : null}
      </View>

      {summary ? (
        <>
          <Divider />
          <Text style={typography.cardHeading}>Zusammenfassung</Text>
          <Text style={[typography.bodyMuted, styles.summary]}>{summary}</Text>
        </>
      ) : null}

      <View style={styles.badges}>
        {badges.map((label) => (
          <Badge key={label} label={label} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleText: {
    flex: 1,
    gap: spacing.xs,
  },
  summary: {
    marginTop: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
