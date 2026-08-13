import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Shown beside "Anwenden" only when something is selected. */
  onReset?: () => void;
  children: ReactNode;
};

/** Stands in for the panel's height until the first layout measures it. */
const ASSUMED_HEIGHT = 420;

export function BottomSheet({ visible, title, onClose, onReset, children }: Props) {
  const insets = useSafeAreaInsets();

  const [progress] = useState(() => new Animated.Value(0));
  const [height, setHeight] = useState(ASSUMED_HEIGHT);

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Schließen" />

        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[
            styles.panel,
            { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY }] },
          ]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={typography.cardHeading}>{title}</Text>
            {onReset ? (
              <Pressable onPress={onReset} hitSlop={8}>
                <Text style={[typography.subtitle, styles.reset]}>Zurücksetzen</Text>
              </Pressable>
            ) : null}
          </View>

          {children}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => [styles.apply, pressed && styles.pressed]}>
            <Text style={[typography.button, styles.applyLabel]}>Anwenden</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  panel: {
    /** Never taller than most of the screen — the topic list has 184 entries. */
    maxHeight: '85%',
    backgroundColor: colors.screen,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.inputBorder,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reset: {
    color: colors.accent,
  },
  apply: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.control,
  },
  applyLabel: {
    color: colors.onAccent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
