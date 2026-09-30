import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StanceMark } from '@/components/ui/stance-mark';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/** explains the plus and minus on a speech, shown under every speech list */
export function SpeechLegend() {
  const { t } = useTranslation();

  return (
    <View style={styles.legend}>
      <View style={styles.item}>
        <StanceMark infavor size={18} />
        <Text style={typography.caption}>{t('common:detail.speechLegend.pro')}</Text>
      </View>
      <View style={styles.item}>
        <StanceMark infavor={false} size={18} />
        <Text style={typography.caption}>{t('common:detail.speechLegend.against')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.lg,
    rowGap: spacing.xs,
    marginTop: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
