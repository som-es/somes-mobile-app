import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Wordmark from '@/assets/somes-wordmark.svg';
import { colors } from '@/theme/colors';
import { HEADER_HEIGHT, spacing } from '@/theme/layout';

type Props = {
  /** Show a dot on the bell. Wire to unread state once push lands. */
  hasUnread?: boolean;
};

/**
 * The Figma draws the logo as a separate mark plus the word "somes" in the UI
 * font, but `somes-wordmark.svg` already contains both as paths and renders the
 * same thing. It is also the only logo asset that uses inline presentation
 * attributes — `somes-mark.svg` and `somes-icon.svg` style themselves with a
 * `<style>` CSS block, which react-native-svg does not apply. Don't swap to
 * those without flattening their CSS into attributes first.
 */
export function AppHeader({ hasUnread = false }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Wordmark
          width={120}
          height={34}
          fill={colors.onChrome}
          stroke={colors.onChrome}
          accessibilityRole="header"
          accessibilityLabel="somes"
        />

        <Pressable
          onPress={() => router.push('/notifications')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Benachrichtigungen"
          style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}>
          <Ionicons name="notifications-outline" size={24} color={colors.onChrome} />
          {hasUnread ? <View style={styles.dot} /> : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.chrome,
  },
  bar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
  },
  bell: {
    padding: spacing.xs,
  },
  bellPressed: {
    opacity: 0.6,
  },
  dot: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
});
