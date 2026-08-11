import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import DelegatesIcon from '@/assets/icons/delegates.svg';
import HomeIcon from '@/assets/icons/home.svg';
import UserIcon from '@/assets/icons/user.svg';
import { colors } from '@/theme/colors';
import { spacing, TAB_BAR_HEIGHT } from '@/theme/layout';

/**
 * Custom tab bar rather than expo-router's NativeTabs: the design needs the
 * navy bar with a circular highlight behind the active icon, which the platform
 * tab bar cannot produce. A JS bar also guarantees iOS and Android look alike.
 */

/**
 * expo-router vendors its own copy of the bottom-tabs types, which are not
 * assignable to @react-navigation/bottom-tabs'. Derive the prop type from the
 * component that consumes it instead of importing either.
 */
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type IconProps = { color: string; size: number };

const ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  // The somes ∞ mark doubles as the Home icon, as in the design.
  index: ({ color, size }) => svgIcon(HomeIcon, { color, size, aspect: 81.416 / 28.318 }),
  abstimmungen: ({ color, size }) => (
    <Ionicons name="business-outline" size={size} color={color} />
  ),
  abgeordnete: ({ color, size }) => svgIcon(DelegatesIcon, { color, size }),
  profil: ({ color, size }) => svgIcon(UserIcon, { color, size }),
};

function svgIcon(
  Icon: React.FC<SvgProps>,
  { color, size, aspect = 1 }: IconProps & { aspect?: number }
) {
  return <Icon width={size * aspect} height={size} fill={color} stroke={color} />;
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const renderIcon = ICONS[route.name];

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
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title}
              style={styles.tab}>
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                {renderIcon?.({ color: colors.onChrome, size: 26 })}
              </View>
            </Pressable>
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
    justifyContent: 'space-evenly',
    paddingHorizontal: spacing.sm,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** White at 10%, per the Figma — not a solid accent disc. */
  iconWrapActive: {
    backgroundColor: colors.tabActive,
  },
});
