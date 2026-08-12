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
});
