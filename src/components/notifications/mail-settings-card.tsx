import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { mailKey, useCategories, useLoadError } from '@/components/notifications/categories';
import { Card } from '@/components/ui/card';
import { SettingRow } from '@/components/ui/setting-row';
import { SkeletonBar } from '@/components/ui/skeleton';
import { useMailSettings, useUpdateMailSettings } from '@/lib/use-push';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';
import type { MailSendInfo } from '@/types';

export function MailSettingsCard() {
  const { t } = useTranslation('notifications');
  const categories = useCategories();
  const loadError = useLoadError();
  const settings = useMailSettings();
  const update = useUpdateMailSettings();

  function toggle(key: keyof MailSendInfo, value: boolean) {
    if (!settings.data) return;
    update.mutate({ ...settings.data, [key]: value });
  }

  return (
    <Card style={styles.card}>
      <Text style={typography.cardHeading}>{t('mail.heading')}</Text>
      <Text style={typography.caption}>{t('mail.caption')}</Text>

      {settings.isError ? (
        <Text style={typography.bodyMuted}>{loadError}</Text>
      ) : settings.isPending ? (
        <View style={styles.rows}>
          <SkeletonBar width="100%" height={44} />
          <SkeletonBar width="100%" height={44} />
          <SkeletonBar width="100%" height={44} />
        </View>
      ) : (
        <View style={styles.rows}>
          {categories.map((category) => {
            const key = mailKey(category.key);
            return (
              <SettingRow
                key={key}
                label={category.label}
                description={category.description}
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
