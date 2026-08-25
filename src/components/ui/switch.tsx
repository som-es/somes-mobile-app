import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

/** Figma node 286:723 draws the toggle at 53×27. */
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

/**
 * Deliberately not React Native's `Switch`, for the same reason the tab bar is
 * custom: the platform controls do not agree with each other — Android's
 * Material 3 switch draws a checkmark inside the thumb and sizes itself — and
 * the Figma specifies one shape for both.
 *
 * Only `translateX` and `opacity` are animated, so the whole thing runs on the
 * native driver; `backgroundColor` cannot, hence the accent fill is a second
 * layer that fades in rather than a colour interpolation.
 */
export function Switch({ value, onValueChange, disabled = false, accessibilityLabel }: Props) {
  // `useState` rather than `useRef`, matching `bottom-sheet.tsx`: with the React
  // Compiler on, reading `ref.current` during render is a lint error.
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
