/* the device side of push, everything that talks to expo-notifications lives here so
   the hooks in use-push can stay about react-query and the backend */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '@/theme/colors';
import type { PushPlatform } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

/** ok carries a token to register, denied means the user said no or has not been
    asked yet, unsupported means asking would be pointless — an emulator or a build
    without an eas project id never gets a token no matter the permission */
export type PushTokenResult =
  | { status: 'ok'; token: string }
  | { status: 'denied' }
  | { status: 'unsupported' };

export function pushPlatform(): PushPlatform {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

/** request: false only reads the current permission, so the silent re-registration on
    launch can never put a dialog in front of someone who has not asked for push */
export async function getExpoPushToken({
  request,
}: {
  request: boolean;
}): Promise<PushTokenResult> {
  // push only works on physical devices
  if (!Device.isDevice) {
    return { status: 'unsupported' };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn('No EAS projectId found — cannot fetch an Expo push token.');
    return { status: 'unsupported' };
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    if (!request) return { status: 'denied' };
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') {
    return { status: 'denied' };
  }

  // android drops notifications that arrive without a channel, and the channel has to
  // exist before the first one does, not before the token is fetched
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Benachrichtigungen',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: colors.accent,
    });
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: 'ok', token: data };
  } catch (error) {
    console.warn(`Could not fetch the Expo push token: ${error}`);
    return { status: 'unsupported' };
  }
}
