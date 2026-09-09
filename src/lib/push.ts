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
    asked yet. the last two are deliberately separate: unsupported is the one case that
    can never work no matter what — an emulator has no fcm/apns registration to build a
    token on — while error is something broken right now, a missing project id or a
    build without google-services.json, which a retry fixes once the config is right */
export type PushTokenResult =
  | { status: 'ok'; token: string }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'error'; message: string };

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
  // the only genuine unsupported: a simulator has no push registration to hand out
  if (!Device.isDevice) {
    return { status: 'unsupported' };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    // a config bug, not a device limitation — the same device works once it is built
    // against an app config that carries extra.eas.projectId
    const message = 'Keine EAS projectId in der App-Konfiguration gefunden.';
    console.warn(message);
    return { status: 'error', message };
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

  // the native message is the useful part and has to survive to the ui: android
  // rejects here when the build has no google-services.json, and it says so by name,
  // which is the difference between a one line config fix and a debugging session
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: 'ok', token: data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Could not fetch the Expo push token: ${message}`);
    return { status: 'error', message };
  }
}
