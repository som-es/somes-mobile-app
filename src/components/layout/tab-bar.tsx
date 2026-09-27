import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DelegatesIcon from '@/assets/icons/delegates.svg';
import HomeIcon from '@/assets/icons/home.svg';
import ThumbsIcon from '@/assets/icons/thumbs.svg';
import UserIcon from '@/assets/icons/user.svg';
import { useQuestionsEnabled } from '@/lib/use-questions';
import { colors } from '@/theme/colors';
import { ICON_SIZE, spacing, TAB_BAR_HEIGHT, TAB_BUTTON, TAB_GAP } from '@/theme/layout';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** smaller than the Ionicons' 24, since these hand-drawn glyphs fill their
    viewBox edge-to-edge with no built-in padding, unlike an Ionicon */
const TAB_ICON_SIZE = 30;

/** the brand's own flat-color line icons, one per main tab; rendered into the
    same size×size box regardless of each svg's own viewBox aspect ratio, so
    react-native-svg's default preserveAspectRatio scales every icon down to
    fit and centers it, keeping all four the same visual size */
const TAB_ICONS: Record<string, typeof HomeIcon> = {
  index: HomeIcon,
  abstimmungen: ThumbsIcon,
  abgeordnete: DelegatesIcon,
  profil: UserIcon,
};

/** fragen has no brand icon yet, so it keeps the Ionicons pair */
const IONICONS: Record<string, { inactive: IoniconName; active: IoniconName }> = {
  fragen: { inactive: 'chatbubble-outline', active: 'chatbubble' },
};

type TabButtonProps = {
  routeName: string;
  isFocused: boolean;
  label?: string;
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({ routeName, isFocused, label, onPress, onLongPress }: TabButtonProps) {
  const [progress] = useState(() => new Animated.Value(isFocused ? 1 : 0));
  const color = isFocused ? colors.onChrome : colors.onChromeMuted;
  const TabIcon = TAB_ICONS[routeName];
  const ionicon = IONICONS[routeName];

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [isFocused, progress]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
      <Animated.View
        style={[
          styles.highlight,
          {
            opacity: progress,
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              },
            ],
          },
        ]}
      />
      {TabIcon ? (
        <TabIcon width={TAB_ICON_SIZE} height={TAB_ICON_SIZE} color={color} />
      ) : ionicon ? (
        <Ionicons
          name={isFocused ? ionicon.active : ionicon.inactive}
          size={ICON_SIZE}
          color={color}
        />
      ) : null}
    </Pressable>
  );
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const questionsEnabled = useQuestionsEnabled();
  const focusedKey = state.routes[state.index]?.key;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {state.routes
          .filter((route) => route.name !== 'fragen' || questionsEnabled)
          .map((route) => {
            const isFocused = route.key === focusedKey;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                label={options.tabBarAccessibilityLabel ?? options.title}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: 'tabLongPress', target: route.key })
                }
              />
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.chrome,
  },
  bar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: TAB_GAP,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    width: TAB_BUTTON,
    height: TAB_BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  highlight: {
    position: 'absolute',
    width: TAB_BUTTON,
    height: TAB_BUTTON,
    borderRadius: 999,
    backgroundColor: colors.tabActive,
  },
});
