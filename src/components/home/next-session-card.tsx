import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/card';
import { isoToDotDate, relativeDayLabel } from '@/lib/date';
import { useLocale } from '@/lib/use-locale';
import { colors, primary } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  date: string | null;
  title: string;
};

export function NextSessionCard({ date, title }: Props) {
  const { t } = useTranslation('home');
  const locale = useLocale();
  const relative = date ? relativeDayLabel(date, locale) : null;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={typography.cardTitle}>{title}</Text>
          <Text style={typography.caption}>
            {date
              ? relative
                ? t('session.dateWithRelative', { date: isoToDotDate(date, locale), relative })
                : t('session.date', { date: isoToDotDate(date, locale) })
              : t('session.dateUnknown')}
          </Text>
        </View>
        <Ionicons name="calendar-outline" size={32} color={primary[500]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.sessionCard,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
