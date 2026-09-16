import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

import { Switch } from './switch';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

/** label plus switch, the row itself is not pressable — the switch is the target, so a
    scroll that starts on the label never flips a setting by accident */
export function SettingRow({ label, description, value, onValueChange, disabled }: Props) {
  return (
    <View style={[styles.row, disabled && styles.disabled]}>
      <View style={styles.text}>
        <Text style={typography.subtitle}>{label}</Text>
        {description ? <Text style={typography.caption}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 44,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  disabled: {
    opacity: 0.45,
  },
});
