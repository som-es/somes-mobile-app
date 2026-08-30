/* client side only, somes-api has no push support at all, no token table, no endpoint */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { postWithAuth } from '@/api/authed';
import { colors } from '@/theme/colors';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Benachrichtigungen',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: colors.accent,
    });
  }

  // push only works on physical devices
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn('No EAS projectId found — cannot fetch an Expo push token.');
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (error) {
    console.warn(`Could not fetch the Expo push token: ${error}`);
    return null;
  }
}

/** todo, add the push token endpoint in somes-api, then drop this guard */
const PUSH_TOKEN_ENDPOINT_EXISTS = false;

export async function registerPushToken(token: string): Promise<void> {
  if (!PUSH_TOKEN_ENDPOINT_EXISTS) {
    console.info(`Push token not registered — no backend endpoint yet. Token: ${token}`);
    return;
  }
  await postWithAuth('v1/user/push_token', { token, platform: Platform.OS });
}
