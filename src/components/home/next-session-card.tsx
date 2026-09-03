import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { isoToDotDate, relativeDayLabel } from '@/lib/date';
import { colors, primary } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  date: string | null;
  title: string;
};

export function NextSessionCard({ date, title }: Props) {
  const relative = date ? relativeDayLabel(date) : null;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={typography.cardTitle}>{title}</Text>
          <Text style={typography.caption}>
            {date
              ? `am ${isoToDotDate(date)}${relative ? ` (${relative})` : ''}`
              : 'Termin noch nicht bekannt'}
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
