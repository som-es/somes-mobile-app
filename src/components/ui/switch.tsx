import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

const TRACK_WIDTH = 53;
const TRACK_HEIGHT = 27;
const PADDING = 3;
const THUMB = TRACK_HEIGHT - PADDING * 2;
const TRAVEL = TRACK_WIDTH - THUMB - PADDING * 2;

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** custom instead of the react native switch, the platform ones disagree with each
    other, only translatex and opacity animate so it stays on the native driver */
export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }: Props) {
  // usestate, not useref, with the react compiler on reading ref.current during render lints
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, disabled && styles.disabled]}>
      <Animated.View style={[styles.fill, { opacity: progress }]} />
      <View style={styles.thumbLane}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 999,
    backgroundColor: colors.inputBorder,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  thumbLane: {
    padding: PADDING,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 999,
    backgroundColor: colors.cardRaised,
  },
  disabled: {
    opacity: 0.5,
  },
});
