import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/layout/app-header';
import { Card } from '@/components/ui/card';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { getExpoPushToken, registerPushToken } from '@/lib/push';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export default function NotificationsScreen() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    getExpoPushToken().then((result) => {
      if (result) {
        setToken(result);
        registerPushToken(result);
      } else {
        setDenied(true);
      }
    });
  }, []);

  return (
    <View style={styles.root}>
      <AppHeader />
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={typography.body}>Zurück</Text>
        </Pressable>

        <ScreenTitle title="Benachrichtigungen" subtitle="Noch keine Benachrichtigungen" />

        {/* Dev aid: lets you send a test push from expo.dev to this device. */}
        {__DEV__ ? (
          <Card>
            <Text style={typography.cardTitle}>Push-Token (nur Entwicklung)</Text>
            <Text style={typography.caption} selectable>
              {token ?? (denied ? 'Keine Berechtigung oder kein echtes Gerät' : 'Wird geladen…')}
            </Text>
          </Card>
        ) : null}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
