import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

/**
 * User profile. Backed by `getUser()`, `getMailSendInfo()` /
 * `updateMailSendInfo()`, `getUserTopics()` and the bookmark endpoints.
 *
 * Note the design says "E-Mail Benachrichtigungen" — those toggles map to
 * MailSendInfo. Push preferences will need separate backend fields.
 */
export default function ProfilScreen() {
  return (
    <Screen>
      <ScreenTitle title="Benutzerprofil" subtitle="Verwalte deine Einstellungen und Präferenzen" />

      <Card variant="outlined">
        <View style={styles.row}>
          <View style={styles.grow}>
            <Text style={typography.cardHeading}>Benutzerinfos</Text>
            <Text style={typography.caption}>Nicht angemeldet</Text>
          </View>
          <Pressable style={styles.accentButton}>
            <Text style={[typography.button, styles.accentButtonLabel]}>Anmelden</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text style={typography.cardHeading}>E-Mail Benachrichtigungen</Text>
        <Text style={typography.caption}>Einstellungen werden geladen</Text>
      </Card>

      <Card>
        <Text style={typography.cardHeading}>Wähle deine Interessen</Text>
        <Text style={typography.caption}>Themen werden geladen</Text>
      </Card>

      <Card variant="outlined">
        <Text style={typography.cardHeading}>Favorisierte Personen</Text>
        <Text style={typography.caption}>Keine favorisierten Personen vorhanden</Text>
      </Card>

      <Card variant="outlined">
        <Text style={typography.cardHeading}>Favorisierte Abstimmungen</Text>
        <Text style={typography.caption}>Keine favorisierten Abstimmungen vorhanden</Text>
      </Card>

      <Card style={styles.danger}>
        <Text style={[typography.cardHeading, styles.dangerTitle]}>Gefahrenbereich</Text>
        <Text style={[typography.caption, styles.dangerSubtitle]}>
          Diese Aktion kann nicht rückgängig gemacht werden
        </Text>
        <Pressable style={styles.dangerButton}>
          <Text style={[typography.button, styles.accentButtonLabel]}>Account löschen</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  grow: {
    flex: 1,
  },
  accentButton: {
    height: 31,
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
  },
  accentButtonLabel: {
    color: colors.onAccent,
  },
  danger: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.md,
  },
  dangerTitle: {
    color: colors.danger,
  },
  dangerSubtitle: {
    color: colors.dangerSubtle,
  },
  dangerButton: {
    height: 31,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
  },
});
