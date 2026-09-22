import { StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, LOAD_ERROR } from '@/components/notifications/categories';
import { Card } from '@/components/ui/card';
import { SettingRow } from '@/components/ui/setting-row';
import { SkeletonBar } from '@/components/ui/skeleton';
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
  const { enabled, deviceStatus, deviceError, isPending } = usePushEnabled();
  const settings = usePushSettings();
  const update = useUpdatePushSettings();

  // only a simulator is beyond help; an error is a build or config fault that a tap
  // retries, so it explains itself but never takes the switch away
  const unsupported = deviceStatus === 'unsupported';
  const failed = deviceStatus === 'error';

  function toggle(key: keyof NotificationSettings, value: boolean) {
    if (!settings.data) return;
    // the put replaces the record, so the untouched fields have to ride along
    update.mutate({ ...settings.data, [key]: value });
  }

  return (
    <Card style={styles.card}>
      <Text style={typography.cardHeading}>Push-Benachrichtigungen</Text>

      <View style={styles.master}>
        <SettingRow
          label="Auf diesem Gerät"
          description={
            unsupported
              ? 'Push funktioniert nur auf einem echten Gerät, nicht im Emulator.'
              : failed
                ? 'Dieses Gerät konnte sich nicht für Push registrieren. Tippe erneut, um es noch einmal zu versuchen.'
                : undefined
          }
          value={enabled}
          onValueChange={onToggleMaster}
          disabled={unsupported || isPending || masterPending}
        />
        {/* the raw native message, verbatim — it is the line that names
            googleServicesFile when the build is missing google-services.json */}
        {deviceError ? <Text style={typography.caption}>{deviceError}</Text> : null}
      </View>

      <View style={styles.divider} />

      {/* the categories are per platform and belong to the account, not to this
          device — somes-api stores them whether or not a token is registered, so they
          stay editable with the switch above off, they just have nowhere to arrive */}
      {!enabled ? (
        <Text style={typography.caption}>
          Diese Auswahl gilt für alle deine Geräte. Damit auf diesem Gerät etwas ankommt,
          muss der Schalter oben eingeschaltet sein.
        </Text>
      ) : null}

      {settings.isError ? (
        <Text style={typography.bodyMuted}>{LOAD_ERROR}</Text>
      ) : settings.isPending ? (
        <View style={styles.rows}>
          <SkeletonBar width="100%" height={44} />
          <SkeletonBar width="100%" height={44} />
          <SkeletonBar width="100%" height={44} />
        </View>
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
  master: {
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inputBorder,
  },
  rows: {
    gap: spacing.md,
  },
});
