import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { somes } from '@/lib/somes';
import { useSession } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export function DangerZoneCard() {
  const { signOut } = useSession();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await somes.account.deleteAccount();
    } catch {
      // somes-frontend clears the jwt regardless, so a failed delete looks like it worked
      Alert.alert(
        'Account konnte nicht gelöscht werden',
        'Bitte versuche es später erneut. Dein Account ist unverändert.'
      );
      return;
    } finally {
      setPending(false);
    }
    await signOut();
  }

  function confirm() {
    Alert.alert(
      'Account löschen?',
      'Deine Interessen, Favoriten und Benachrichtigungen werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: remove },
      ]
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={[typography.cardHeading, styles.title]}>Gefahrenbereich</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        Diese Aktion kann nicht rückgängig gemacht werden
      </Text>
      <Button label="Account löschen" onPress={confirm} variant="danger" loading={pending} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.md,
  },
  title: {
    color: colors.danger,
  },
  subtitle: {
    color: colors.dangerSubtle,
  },
});
