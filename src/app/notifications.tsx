import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

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
        <ScreenTitle title="Benachrichtigungen" />
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>Melde dich an</Text>
          <Text style={typography.bodyMuted}>
            Benachrichtigungen richten sich nach deinen Favoriten und Interessen. Dafür
            brauchst du ein Konto.
          </Text>
          <Button label="Anmelden" onPress={() => router.push('/anmelden')} size="lg" />
        </Card>
      </SubScreen>
    );
  }

  return (
    <SubScreen onRefresh={refresh}>
      <ScreenTitle
        title="Benachrichtigungen"
        subtitle="Wähle, worüber wir dich informieren dürfen"
      />

      {failure?.status === 'denied' ? (
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>Berechtigung fehlt</Text>
          <Text style={typography.bodyMuted}>
            Benachrichtigungen sind für somes in den Systemeinstellungen deaktiviert. Ohne
            sie kann dieses Gerät keine Push-Nachrichten empfangen.
          </Text>
          <Button
            label="Einstellungen öffnen"
            onPress={() => Linking.openSettings()}
            variant="ghost"
            size="lg"
          />
        </Card>
      ) : null}

      {failure?.status === 'error' ? (
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>Push konnte nicht aktiviert werden</Text>
          <Text style={typography.bodyMuted}>
            Die Berechtigung steht, aber dieses Gerät konnte sich nicht für Push
            registrieren. Das liegt an der App, nicht an deinen Einstellungen. Bitte
            versuche es später erneut.
          </Text>
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
