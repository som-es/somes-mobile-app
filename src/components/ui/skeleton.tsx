import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { primary } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

import { Card } from './card';

function usePulse() {
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
}

const BARS = ['85%', '100%', '60%'] as const;

const ROW_AVATAR = 48;

/** stands in for a DelegateRow while its name/party lookup is still loading, so
    a row never has to fall back to a placeholder name just because data hasn't
    arrived yet */
export function RowSkeleton() {
  const opacity = usePulse();

  return (
    <Card variant="outlined" elevation="row">
      <Animated.View style={[styles.row, { opacity }]}>
        <View style={styles.avatar} />
        <View style={styles.rowBars}>
          <View style={[styles.bar, { width: '70%' }]} />
          <View style={[styles.bar, styles.barSmall, { width: '40%' }]} />
        </View>
      </Animated.View>
    </Card>
  );
}

export function CardSkeleton() {
  const opacity = usePulse();

  return (
    <Card>
      <Animated.View style={[styles.bars, { opacity }]}>
        {BARS.map((width) => (
          <View key={width} style={[styles.bar, { width }]} />
        ))}
        <View style={styles.badges}>
          <View style={[styles.badge, { width: 96 }]} />
          <View style={[styles.badge, { width: 56 }]} />
          <View style={[styles.badge, { width: 72 }]} />
        </View>
      </Animated.View>
    </Card>
  );
}

const styles = StyleSheet.create({
  bars: {
    gap: spacing.sm,
  },
  bar: {
    height: 12,
    borderRadius: radius.thumb,
    backgroundColor: primary[100],
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  badge: {
    height: 24,
    borderRadius: radius.badge,
    backgroundColor: primary[100],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: ROW_AVATAR,
    height: ROW_AVATAR,
    borderRadius: 999,
    backgroundColor: primary[100],
  },
  rowBars: {
    flex: 1,
    gap: spacing.sm,
  },
  barSmall: {
    height: 10,
  },
});
