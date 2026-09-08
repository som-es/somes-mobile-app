import { StyleSheet, Text, View } from 'react-native';

import { CATEGORIES } from '@/components/notifications/categories';
import { Card } from '@/components/ui/card';
import { SettingRow } from '@/components/ui/setting-row';
import { usePushEnabled, usePushSettings, useUpdatePushSettings } from '@/lib/use-push';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { NotificationSettings } from '@/types';

type Props = {
  onToggleMaster: (next: boolean) => void;
  masterPending: boolean;
};

export function PushSettingsCard({ onToggleMaster, masterPending }: Props) {
  const { enabled, deviceStatus, isPending } = usePushEnabled();
  const settings = usePushSettings();
  const update = useUpdatePushSettings();

  const unsupported = deviceStatus === 'unsupported';

  function toggle(key: keyof NotificationSettings, value: boolean) {
    if (!settings.data) return;
    // the put replaces the record, so the untouched fields have to ride along
    update.mutate({ ...settings.data, [key]: value });
  }

  return (
    <Card style={styles.card}>
      <Text style={typography.cardHeading}>Push-Benachrichtigungen</Text>

      <SettingRow
        label="Auf diesem Gerät"
        description={
          unsupported
            ? 'Push braucht ein echtes Gerät, im Simulator gibt es keinen Token.'
            : 'Wir fragen beim Einschalten einmalig nach der Berechtigung.'
        }
        value={enabled}
        onValueChange={onToggleMaster}
        disabled={unsupported || isPending || masterPending}
      />

      <View style={styles.divider} />

      {/* the categories are per platform and belong to the account, not to this
          device — somes-api stores them whether or not a token is registered, so they
          stay editable with the switch above off, they just have nowhere to arrive */}
      {!enabled ? (
        <Text style={typography.caption}>
          Gilt für alle deine Geräte. Damit etwas ankommt, muss der Schalter oben an sein.
        </Text>
      ) : null}

      {settings.isError ? (
        <Text style={typography.bodyMuted}>Einstellungen konnten nicht geladen werden.</Text>
      ) : (
        <View style={styles.rows}>
          {CATEGORIES.map((category) => (
            <SettingRow
              key={category.key}
              label={category.label}
              description={category.description}
              value={settings.data?.[category.key] ?? false}
              onValueChange={(value) => toggle(category.key, value)}
              disabled={settings.data === undefined}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBorder,
  },
  rows: {
    gap: spacing.md,
  },
});
