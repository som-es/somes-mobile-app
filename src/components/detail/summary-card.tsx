import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  /** whether title/summary came from ai_summary rather than a raw field, so the
      disclaimer badge only shows when that's actually true */
  aiGenerated?: boolean;
  badges: string[];
  accepted?: boolean | null;
};

export function SummaryCard({
  title,
  subtitle,
  summary,
  aiGenerated = false,
  badges,
  accepted = null,
}: Props) {
  const { t } = useTranslation();

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
          <View style={styles.summaryHead}>
            <Text style={typography.cardHeading}>{t('common:detail.summaryHeading')}</Text>
            {aiGenerated ? <Badge label={t('common:detail.aiGeneratedBadge')} /> : null}
          </View>
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
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
