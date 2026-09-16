/* push and e-mail notification preferences, both sit on the account resource and both
   read the same nine categories, so they share this module */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getExpoPushToken, pushPlatform, type PushTokenResult } from '@/lib/push';
import { somes } from '@/lib/somes';
import { useAuth } from '@/lib/use-auth';
import type { MailSendInfo, NotificationSettings, PushTokenInfo } from '@/types';

export const PUSH_DEVICE_KEY = ['push-device-token'] as const;
export const PUSH_TOKENS_KEY = ['push-tokens'] as const;
export const PUSH_SETTINGS_KEY = ['push-settings'] as const;
export const MAIL_INFO_KEY = ['mail-send-info'] as const;

/** the token this device would register, read without ever prompting. it only changes
    when expo rotates it, which the registrar below watches for, so it never goes stale
    on its own */
export function useDevicePushToken() {
  return useQuery({
    queryKey: PUSH_DEVICE_KEY,
    queryFn: () => getExpoPushToken({ request: false }),
    staleTime: Infinity,
  });
}

export function usePushTokens() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: PUSH_TOKENS_KEY,
    queryFn: () => somes.account.pushTokens(),
    enabled: isAuthenticated,
  });
}

/** whether push is on is not stored locally — it is whether the backend knows this
    device's token, so it cannot drift from what the server will actually send to */
export function usePushEnabled() {
  const device = useDevicePushToken();
  const tokens = usePushTokens();

  const deviceToken = device.data?.status === 'ok' ? device.data.token : null;
  const enabled =
    deviceToken !== null &&
    (tokens.data ?? []).some((entry) => entry.push_token === deviceToken && entry.enabled);

  return {
    enabled,
    deviceToken,
    /** unsupported disables the toggle, denied only means not granted yet, error is
        fixable and leaves it tappable */
    deviceStatus: device.data?.status ?? null,
    /** the native reason, from the passive read at mount — the config failures this
        names surface here long before anyone presses the toggle */
    deviceError: device.data?.status === 'error' ? device.data.message : null,
    isPending: device.isPending || tokens.isPending,
  };
}

/** resolves with the token result when turning on, so the screen can tell a refused
    permission from a successful registration rather than silently leaving the switch
    off, and with null when turning off */
export function useTogglePush() {
  const queryClient = useQueryClient();
  const { deviceToken } = usePushEnabled();

  return useMutation({
    mutationFn: async (next: boolean): Promise<PushTokenResult | null> => {
      if (!next) {
        if (deviceToken) await somes.account.removePushToken(deviceToken);
        return null;
      }

      const result = await getExpoPushToken({ request: true });
      if (result.status === 'ok') {
        await somes.account.registerPushToken(result.token, pushPlatform());
      }
      return result;
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: PUSH_TOKENS_KEY });
      const previous = queryClient.getQueryData<PushTokenInfo[]>(PUSH_TOKENS_KEY);
      // only the off direction can be predicted, turning on may still hit a refused
      // permission dialog and never reach the backend at all
      if (!next && deviceToken) {
        queryClient.setQueryData<PushTokenInfo[]>(PUSH_TOKENS_KEY, (current = []) =>
          current.filter((entry) => entry.push_token !== deviceToken)
        );
      }
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) queryClient.setQueryData(PUSH_TOKENS_KEY, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: PUSH_DEVICE_KEY });
      await queryClient.invalidateQueries({ queryKey: PUSH_TOKENS_KEY });
      // a first registration is what creates the settings row server side
      await queryClient.invalidateQueries({ queryKey: PUSH_SETTINGS_KEY });
    },
  });
}

export function usePushSettings() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: PUSH_SETTINGS_KEY,
    queryFn: () => somes.account.notificationSettings(pushPlatform()),
    enabled: isAuthenticated,
  });
}

/** the put replaces the whole record, so a single toggle has to send the rest back
    unchanged, same as somes-frontend does */
export function useUpdatePushSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: NotificationSettings) =>
      somes.account.updateNotificationSettings(settings),
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: PUSH_SETTINGS_KEY });
      const previous = queryClient.getQueryData<NotificationSettings>(PUSH_SETTINGS_KEY);
      queryClient.setQueryData<NotificationSettings>(PUSH_SETTINGS_KEY, settings);
      return { previous };
    },
    onError: (_error, _settings, context) => {
      if (context?.previous) queryClient.setQueryData(PUSH_SETTINGS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PUSH_SETTINGS_KEY }),
  });
}

export function useMailSettings() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: MAIL_INFO_KEY,
    queryFn: () => somes.account.mailSendInfo(),
    enabled: isAuthenticated,
  });
}

export function useUpdateMailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: MailSendInfo) => somes.account.updateMailSendInfo(info),
    onMutate: async (info) => {
      await queryClient.cancelQueries({ queryKey: MAIL_INFO_KEY });
      const previous = queryClient.getQueryData<MailSendInfo>(MAIL_INFO_KEY);
      queryClient.setQueryData<MailSendInfo>(MAIL_INFO_KEY, info);
      return { previous };
    },
    onError: (_error, _info, context) => {
      if (context?.previous) queryClient.setQueryData(MAIL_INFO_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: MAIL_INFO_KEY }),
  });
}
