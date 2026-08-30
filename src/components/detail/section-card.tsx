import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  title: string;
  /** Sits opposite the title — the Pro/Contra legend on a member's page. */
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, action, children }: Props) {
  return (
    <Card>
      <View style={styles.head}>
        <Text style={[typography.cardHeading, styles.title]}>{title}</Text>
        {action}
      </View>
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
  },
  body: {
    marginTop: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.inputBorder,
    marginVertical: spacing.lg,
  },
});
