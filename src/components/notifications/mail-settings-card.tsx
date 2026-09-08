import { StyleSheet, Text, View } from 'react-native';

import { CATEGORIES, mailKey } from '@/components/notifications/categories';
import { Card } from '@/components/ui/card';
import { SettingRow } from '@/components/ui/setting-row';
import { useMailSettings, useUpdateMailSettings } from '@/lib/use-push';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { MailSendInfo } from '@/types';

export function MailSettingsCard() {
  const settings = useMailSettings();
  const update = useUpdateMailSettings();

  function toggle(key: keyof MailSendInfo, value: boolean) {
    if (!settings.data) return;
    update.mutate({ ...settings.data, [key]: value });
  }

  return (
    <Card style={styles.card}>
      <Text style={typography.cardHeading}>E-Mail-Benachrichtigungen</Text>
      <Text style={typography.caption}>
        Gehen an die E-Mail-Adresse deines Kontos, unabhängig von diesem Gerät.
      </Text>

      {settings.isError ? (
        <Text style={typography.bodyMuted}>Einstellungen konnten nicht geladen werden.</Text>
      ) : (
        <View style={styles.rows}>
          {CATEGORIES.map((category) => {
            const key = mailKey(category.key);
            return (
              <SettingRow
                key={key}
                label={category.label}
                value={settings.data?.[key] ?? false}
                onValueChange={(value) => toggle(key, value)}
                disabled={settings.data === undefined}
              />
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  rows: {
    gap: spacing.md,
  },
});
