import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MailSettingsCard } from '@/components/notifications/mail-settings-card';
import { PushSettingsCard } from '@/components/notifications/push-settings-card';
import { SubScreen } from '@/components/layout/sub-screen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenTitle } from '@/components/ui/screen';
import type { PushTokenResult } from '@/lib/push';
import { useAuth } from '@/lib/use-auth';
import {
  MAIL_INFO_KEY,
  PUSH_SETTINGS_KEY,
  PUSH_TOKENS_KEY,
  useTogglePush,
} from '@/lib/use-push';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export default function NotificationsScreen() {
  const { t } = useTranslation('notifications');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const toggle = useTogglePush();
  /** why the last attempt to turn push on did not stick, so the banner below can tell a
      refused permission from a device that never got a token */
  const [failure, setFailure] = useState<PushTokenResult | null>(null);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: PUSH_TOKENS_KEY });
    queryClient.invalidateQueries({ queryKey: PUSH_SETTINGS_KEY });
    queryClient.invalidateQueries({ queryKey: MAIL_INFO_KEY });
  }

  function toggleMaster(next: boolean) {
    setFailure(null);
    toggle.mutate(next, {
      // null is the off direction, only an attempt to turn on can fail
      onSuccess: (result) =>
        setFailure(
          result?.status === 'denied' || result?.status === 'error' ? result : null
        ),
    });
  }

  if (!isAuthenticated) {
    return (
      <SubScreen>
        <ScreenTitle title={t('title')} />
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>{t('signIn.heading')}</Text>
          <Text style={typography.bodyMuted}>{t('signIn.body')}</Text>
          <Button label={t('signIn.cta')} onPress={() => router.push('/anmelden')} size="lg" />
        </Card>
      </SubScreen>
    );
  }

  return (
    <SubScreen onRefresh={refresh}>
      <ScreenTitle title={t('title')} subtitle={t('subtitle')} />

      {failure?.status === 'denied' ? (
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>{t('permissionMissing.heading')}</Text>
          <Text style={typography.bodyMuted}>{t('permissionMissing.body')}</Text>
          <Button
            label={t('permissionMissing.openSettings')}
            onPress={() => Linking.openSettings()}
            variant="ghost"
            size="lg"
          />
        </Card>
      ) : null}

      {failure?.status === 'error' ? (
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>{t('activationFailed.heading')}</Text>
          <Text style={typography.bodyMuted}>{t('activationFailed.body')}</Text>
        </Card>
      ) : null}

      <View style={styles.cards}>
        <PushSettingsCard onToggleMaster={toggleMaster} masterPending={toggle.isPending} />
        <MailSettingsCard />
      </View>
    </SubScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  cards: {
    gap: spacing.lg,
  },
});
