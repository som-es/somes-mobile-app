import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import '@/test/i18n';
import { PushSettingsCard } from '@/components/notifications/push-settings-card';
import { getExpoPushToken, type PushTokenResult } from '@/lib/push';
import { somes } from '@/lib/somes';
import {
  PUSH_SETTINGS_KEY,
  PUSH_TOKENS_KEY,
  usePushEnabled,
  useTogglePush,
  useUpdatePushSettings,
} from '@/lib/use-push';
import type { NotificationSettings, PushTokenInfo } from '@/types';

jest.mock('@/lib/use-auth', () => ({
  __esModule: true,
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock('@/lib/push', () => ({
  __esModule: true,
  getExpoPushToken: jest.fn(),
  pushPlatform: jest.fn(() => 'ios'),
}));

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  somes: {
    account: {
      pushTokens: jest.fn(),
      registerPushToken: jest.fn(),
      removePushToken: jest.fn(),
      notificationSettings: jest.fn(),
      updateNotificationSettings: jest.fn(),
    },
  },
}));

const TOKEN = 'ExponentPushToken[abc]';

const REGISTERED: PushTokenInfo[] = [{ push_token: TOKEN, platform: 'ios', enabled: true }];

/** shortened, but the wording android actually rejects with when the build has no
    google-services.json — the string the ui has to pass through untouched */
const FCM_MESSAGE =
  'Unable to get Firebase Messaging instance. Did you configure `googleServicesFile` path in app config?';

const SETTINGS: NotificationSettings = {
  platform: 'ios',
  send_new_vote_results: true,
  send_new_vote_result_by_favo: false,
  send_new_delegate_activity: false,
  send_new_ministrial_prop: false,
  send_new_ministrial_prop_by_favo: false,
  send_new_decree: false,
  send_new_decree_by_favo: false,
  send_new_proposal: false,
  send_new_proposal_by_favo: false,
};

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
}

/** nothing observes the settings query in the mutation tests, so the default gcTime of
    0 lets the invalidate in onSettled collect the entry out from under the assertion */
function createRetainingQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

// invalidateQueries triggers a background refetch whose result reaches React via a
// notifyManager macrotask; without draining it before the test ends, it fires after
// the tree is torn down and corrupts every render in the tests that follow.
async function flushPendingQueryEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (somes.account.pushTokens as jest.Mock).mockResolvedValue([]);
  (somes.account.notificationSettings as jest.Mock).mockResolvedValue(SETTINGS);
  (getExpoPushToken as jest.Mock).mockResolvedValue({ status: 'ok', token: TOKEN });
});

describe('usePushEnabled', () => {
  it('is on when the backend knows this device token', async () => {
    (somes.account.pushTokens as jest.Mock).mockResolvedValue(REGISTERED);
    const client = createTestQueryClient();

    const { result } = await renderHook(() => usePushEnabled(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.enabled).toBe(true));
    expect(result.current.deviceToken).toBe(TOKEN);
    // the launch path must never prompt
    expect(getExpoPushToken).toHaveBeenCalledWith({ request: false });

    await flushPendingQueryEffects();
  });

  it('is off when another device is registered but this one is not', async () => {
    (somes.account.pushTokens as jest.Mock).mockResolvedValue([
      { push_token: 'ExponentPushToken[other]', platform: 'android', enabled: true },
    ]);
    const client = createTestQueryClient();

    const { result } = await renderHook(() => usePushEnabled(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.enabled).toBe(false);

    await flushPendingQueryEffects();
  });

  it('reports unsupported devices so the screen can explain the disabled toggle', async () => {
    (getExpoPushToken as jest.Mock).mockResolvedValue({ status: 'unsupported' });
    const client = createTestQueryClient();

    const { result } = await renderHook(() => usePushEnabled(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.deviceStatus).toBe('unsupported'));
    expect(result.current.enabled).toBe(false);
    expect(result.current.deviceToken).toBeNull();
    // an emulator has nothing to report beyond being an emulator
    expect(result.current.deviceError).toBeNull();

    await flushPendingQueryEffects();
  });

  it('surfaces the native reason of a failed token read, without any toggle press', async () => {
    (getExpoPushToken as jest.Mock).mockResolvedValue({
      status: 'error',
      message: FCM_MESSAGE,
    });
    const client = createTestQueryClient();

    const { result } = await renderHook(() => usePushEnabled(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.deviceStatus).toBe('error'));
    expect(result.current.deviceError).toBe(FCM_MESSAGE);
    expect(result.current.enabled).toBe(false);
    expect(result.current.deviceToken).toBeNull();

    await flushPendingQueryEffects();
  });
});

/* the regression this pair guards: a build without google-services.json used to report
   itself as an incapable device and grey the switch out for good */
describe('PushSettingsCard, master switch', () => {
  async function renderCard() {
    const client = createTestQueryClient();
    await render(<PushSettingsCard onToggleMaster={jest.fn()} masterPending={false} />, {
      wrapper: createWrapper(client),
    });
  }

  /** re-queried on every check, the row re-renders as the two queries resolve and the
      node captured before that is a stale copy */
  function masterDisabled() {
    return screen.getByRole('switch', { name: 'On this device' }).props
      .accessibilityState.disabled;
  }

  it('stays tappable and shows the native message when the token read errored', async () => {
    (getExpoPushToken as jest.Mock).mockResolvedValue({
      status: 'error',
      message: FCM_MESSAGE,
    });

    await renderCard();

    // the message only appears once the device query resolves, and until it does the
    // row is disabled for being pending — so wait on the text, not on disabled
    await waitFor(() => expect(screen.getByText(FCM_MESSAGE)).toBeTruthy());
    expect(masterDisabled()).toBe(false);
    expect(screen.queryByText(/only works on a real device/)).toBeNull();

    await flushPendingQueryEffects();
  });

  it('disables itself only on a device that can never get a token', async () => {
    (getExpoPushToken as jest.Mock).mockResolvedValue({ status: 'unsupported' });

    await renderCard();

    await waitFor(() => expect(screen.getByText(/only works on a real device/)).toBeTruthy());
    expect(masterDisabled()).toBe(true);

    await flushPendingQueryEffects();
  });
});

describe('useTogglePush', () => {
  it('requests permission and registers the token when turned on', async () => {
    const client = createTestQueryClient();
    const { result } = await renderHook(() => useTogglePush(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync(true);
    });

    expect(getExpoPushToken).toHaveBeenCalledWith({ request: true });
    expect(somes.account.registerPushToken).toHaveBeenCalledWith(TOKEN, 'ios');

    await flushPendingQueryEffects();
  });

  it('reports a refused permission instead of registering', async () => {
    (getExpoPushToken as jest.Mock).mockResolvedValue({ status: 'denied' });
    const client = createTestQueryClient();
    const { result } = await renderHook(() => useTogglePush(), {
      wrapper: createWrapper(client),
    });

    let outcome: PushTokenResult | null = null;
    await act(async () => {
      outcome = await result.current.mutateAsync(true);
    });

    expect(outcome).toEqual({ status: 'denied' });
    expect(somes.account.registerPushToken).not.toHaveBeenCalled();

    await flushPendingQueryEffects();
  });

  it('removes the token and drops it from the cache when turned off', async () => {
    (somes.account.pushTokens as jest.Mock).mockResolvedValue(REGISTERED);
    const client = createTestQueryClient();
    client.setQueryData(PUSH_TOKENS_KEY, REGISTERED);

    const { result } = await renderHook(
      () => ({ toggle: useTogglePush(), state: usePushEnabled() }),
      { wrapper: createWrapper(client) }
    );

    await waitFor(() => expect(result.current.state.enabled).toBe(true));

    await act(async () => {
      await result.current.toggle.mutateAsync(false);
    });

    expect(somes.account.removePushToken).toHaveBeenCalledWith(TOKEN);
    expect(somes.account.registerPushToken).not.toHaveBeenCalled();

    await flushPendingQueryEffects();
  });
});

describe('useUpdatePushSettings', () => {
  it('sends the whole record with one field flipped', async () => {
    const client = createRetainingQueryClient();
    client.setQueryData(PUSH_SETTINGS_KEY, SETTINGS);

    const { result } = await renderHook(() => useUpdatePushSettings(), {
      wrapper: createWrapper(client),
    });

    const next = { ...SETTINGS, send_new_decree: true };
    await act(async () => {
      await result.current.mutateAsync(next);
    });

    expect(somes.account.updateNotificationSettings).toHaveBeenCalledWith(next);
    expect(client.getQueryData(PUSH_SETTINGS_KEY)).toEqual(next);

    await flushPendingQueryEffects();
  });

  it('rolls the cache back when the update rejects', async () => {
    const client = createRetainingQueryClient();
    client.setQueryData(PUSH_SETTINGS_KEY, SETTINGS);
    (somes.account.updateNotificationSettings as jest.Mock).mockRejectedValue(
      new Error('nope')
    );

    const { result } = await renderHook(() => useUpdatePushSettings(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync({ ...SETTINGS, send_new_decree: true }).catch(() => {});
    });

    await waitFor(() => expect(client.getQueryData(PUSH_SETTINGS_KEY)).toEqual(SETTINGS));

    await flushPendingQueryEffects();
  });
});
