import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  title: string;
  children: ReactNode;
};

/** A titled card — "Themen", "Abstimmung", "Reden", "Dokumente". */
export function SectionCard({ title, children }: Props) {
  return (
    <Card>
      <Text style={typography.cardHeading}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

/** The hairline the design draws between a card's blocks. */
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  body: {
    marginTop: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputBorder,
    marginVertical: spacing.lg,
  },
});
