import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VoteMark } from '@/components/ui/vote-mark';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

import { Divider } from './section-card';

type Props = {
  title: string;
  subtitle: string;
  summary: string | null;
  badges: string[];
  accepted?: boolean | null;
};

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
