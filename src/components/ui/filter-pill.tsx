import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/layout";
import { typography } from "@/theme/typography";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  grow?: boolean;
  /** let the label wrap onto a second line instead of shrinking its font */
  wrap?: boolean;
};

export function FilterPill({
  label,
  onPress,
  disabled = false,
  grow = false,
  wrap = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.pill,
        disabled && styles.disabled,
        pressed && styles.pressed,
        grow && styles.growStyle,
      ]}
    >
      <Text
        style={[typography.pillLabel, styles.label, wrap && styles.wrapLabel]}
        numberOfLines={wrap ? undefined : 1}
        adjustsFontSizeToFit={!wrap}
        minimumFontScale={0.75}
      >
        {label}
      </Text>
      <Ionicons name="chevron-down" size={14} color={colors.onAccent} />
    </Pressable>
  );
}

/** below this window width the pills size to their label and wrap, rather than all
    sharing one width and squeezing the longest label */
const COMPACT_WIDTH = 400;

type RowPill = { key: string; label: string; onPress: () => void };

/** a row of pills, equal width when there is room, equal height when there is not */
export function FilterRow({ pills }: { pills: RowPill[] }) {
  const compact = useWindowDimensions().width < COMPACT_WIDTH;

  return (
    <View style={styles.row}>
      {pills.map(({ key, label, onPress }) => (
        <View key={key} style={compact ? styles.slotCompact : styles.slot}>
          <FilterPill
            label={label}
            onPress={onPress}
            grow={compact}
            wrap={compact}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  slot: {
    flex: 1,
  },
  slotCompact: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto",
  },
  wrapLabel: {
    textAlign: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.45,
  },
  growStyle: {
    flexGrow: 1.0,
  },
});
