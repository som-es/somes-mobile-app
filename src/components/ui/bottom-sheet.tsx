import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onReset?: () => void;
  /** called right before onClose when Anwenden is pressed, not on backdrop tap,
      drag-to-dismiss or the hardware back button — for sheets that stage a
      choice locally and only commit it once the user confirms */
  onApply?: () => void;
  /** the bottom button always closes the sheet, this only changes its label —
      the default "Apply" reads wrong on a sheet with nothing to apply, e.g. a
      pure info display */
  applyLabel?: string;
  children: ReactNode;
};

/** stands in for the panel height until the first layout measures it */
const ASSUMED_HEIGHT = 420;

const DURATION = 280;
const EASING = Easing.out(Easing.cubic);

/** a downward drag past this fraction of the panel, or a fast enough flick,
    counts as a dismiss rather than a snap back to open */
const DISMISS_DISTANCE_RATIO = 0.25;
const DISMISS_VELOCITY = 0.8;

export function BottomSheet({
  visible,
  title,
  onClose,
  onReset,
  onApply,
  applyLabel,
  children,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [height, setHeight] = useState(ASSUMED_HEIGHT);
  /** the modal stays mounted for the duration of the closing animation, after
      the caller has already flipped `visible` back to false */
  const [mounted, setMounted] = useState(visible);
  const [translateY] = useState(() => new Animated.Value(ASSUMED_HEIGHT));

  function animateTo(toValue: number, onDone?: () => void) {
    Animated.timing(translateY, {
      toValue,
      duration: DURATION,
      easing: EASING,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onDone?.();
    });
  }

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the internal "still animating" flag to an external prop change
      setMounted(true);
      translateY.setValue(height);
      animateTo(0);
    } else {
      animateTo(height, () => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- height/translateY read fresh, only visible should retrigger this
  }, [visible]);

  /** cheap to recreate each render, so the handlers below always close over
      the latest height and onClose rather than going stale behind a ref */
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderGrant: () => {
      translateY.stopAnimation();
      translateY.extractOffset();
    },
    onPanResponderMove: (_event, gesture) => {
      if (gesture.dy > 0) translateY.setValue(gesture.dy);
    },
    onPanResponderRelease: (_event, gesture) => {
      translateY.flattenOffset();
      const dismiss =
        gesture.dy > height * DISMISS_DISTANCE_RATIO || gesture.vy > DISMISS_VELOCITY;
      if (dismiss) onClose();
      else animateTo(0);
    },
    onPanResponderTerminate: () => {
      translateY.flattenOffset();
      animateTo(0);
    },
  });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityLabel={t('common:bottomSheet.close')}
        />

        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[
            styles.panel,
            { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY }] },
          ]}>
          <View {...panResponder.panHandlers} style={styles.handle}>
            <View style={styles.grabber} />
          </View>

          <View style={styles.header}>
            <Text style={typography.cardHeading}>{title}</Text>
            {onReset ? (
              <Pressable onPress={onReset} hitSlop={8}>
                <Text style={[typography.subtitle, styles.reset]}>{t('common:bottomSheet.reset')}</Text>
              </Pressable>
            ) : null}
          </View>

          {children}

          <Pressable
            onPress={() => {
              onApply?.();
              onClose();
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.apply, pressed && styles.pressed]}>
            <Text style={[typography.button, styles.applyLabel]}>
              {applyLabel ?? t('common:bottomSheet.apply')}
            </Text>
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
    /** never taller than most of the screen, the topic list has 184 entries */
    maxHeight: '85%',
    backgroundColor: colors.screen,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  /** a wider, taller hit area than the pill itself draws, so the drag is easy to grab */
  handle: {
    paddingVertical: spacing.sm,
    marginTop: -spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.inputBorder,
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
