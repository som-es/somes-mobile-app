import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { ICON_SIZE, spacing, TAB_BAR_HEIGHT, TAB_BUTTON, TAB_GAP } from '@/theme/layout';

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { inactive: IoniconName; active: IoniconName }> = {
  index: { inactive: 'home-outline', active: 'home' },
  abstimmungen: { inactive: 'podium-outline', active: 'podium' },
  abgeordnete: { inactive: 'people-outline', active: 'people' },
  profil: { inactive: 'person-circle-outline', active: 'person-circle' },
};

type TabButtonProps = {
  icons: (typeof ICONS)[string] | undefined;
  isFocused: boolean;
  label?: string;
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({ icons, isFocused, label, onPress, onLongPress }: TabButtonProps) {
  const [progress] = useState(() => new Animated.Value(isFocused ? 1 : 0));

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
      {icons ? (
        <Ionicons
          name={isFocused ? icons.active : icons.inactive}
          size={ICON_SIZE}
          color={isFocused ? colors.onChrome : colors.onChromeMuted}
        />
      ) : null}
    </Pressable>
  );
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
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
              icons={ICONS[route.name]}
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
