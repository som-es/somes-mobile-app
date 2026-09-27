import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { Keypoint } from '@/types';

import { SectionCard } from './section-card';

type Props = {
  keyPoints: Keypoint[];
};

export function KeyPointsCard({ keyPoints }: Props) {
  const { t } = useTranslation();

  if (keyPoints.length === 0) return null;

  return (
    <SectionCard title={t('common:detail.keyPoints')}>
      <View style={styles.list}>
        {keyPoints.map((keyPoint, index) => (
          <View key={index} style={styles.row}>
            <Text style={typography.bodyMuted}>{'•'}</Text>
            <Text style={[typography.bodyMuted, styles.label]}>{keyPoint.point}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
  },
});
