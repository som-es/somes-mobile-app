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
  const [permissionRefused, setPermissionRefused] = useState(false);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: PUSH_TOKENS_KEY });
    queryClient.invalidateQueries({ queryKey: PUSH_SETTINGS_KEY });
    queryClient.invalidateQueries({ queryKey: MAIL_INFO_KEY });
  }

  function toggleMaster(next: boolean) {
    setPermissionRefused(false);
    toggle.mutate(next, {
      // null is the off direction, only an attempt to turn on can be refused
      onSuccess: (result) => setPermissionRefused(result?.status === 'denied'),
    });
  }

  if (!isAuthenticated) {
    return (
      <SubScreen>
        <ScreenTitle title="Benachrichtigungen" />
        <Card style={styles.card}>
          <Text style={typography.cardHeading}>Melde dich an</Text>
          <Text style={typography.bodyMuted}>
            Benachrichtigungen richten sich nach deinen gemerkten Abgeordneten und Themen,
            dafür braucht es ein Konto.
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

      {permissionRefused ? (
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
