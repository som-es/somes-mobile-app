import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { PushRegistrar } from '@/components/push-registrar';
import { getExpoPushToken } from '@/lib/push';
import { somes } from '@/lib/somes';

/** captured so a test can play the native module's part and emit a token. the mock
    prefix is what lets jest.mock's factory reach it */
let mockEmit: ((token: { data: string; type: string }) => void) | null = null;

jest.mock('expo-notifications', () => ({
  __esModule: true,
  addPushTokenListener: jest.fn((listener) => {
    mockEmit = listener;
    return { remove: jest.fn() };
  }),
}));

jest.mock('@/lib/use-auth', () => ({
  __esModule: true,
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock('@/lib/push', () => ({
  __esModule: true,
  getExpoPushToken: jest.fn(),
  pushPlatform: jest.fn(() => 'android'),
}));

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  somes: { account: { registerPushToken: jest.fn(), pushTokens: jest.fn() } },
}));

const DEVICE_TOKEN = 'fcm-device-token';
const TOKEN = 'ExponentPushToken[abc]';
const ROTATED = 'ExponentPushToken[def]';

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

/** the native module emits onDevicePushToken from inside getDevicePushTokenAsync, so
    every read of the token echoes back through the listener */
async function emitDeviceToken(data: string) {
  await act(async () => {
    mockEmit?.({ data, type: 'android' });
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEmit = null;
  (somes.account.pushTokens as jest.Mock).mockResolvedValue([]);
  (getExpoPushToken as jest.Mock).mockResolvedValue({ status: 'ok', token: TOKEN });
});

describe('PushRegistrar', () => {
  it('registers once and does not re-enter on the echo of its own token read', async () => {
    await render(<PushRegistrar />, { wrapper: createWrapper() });

    await waitFor(() =>
      expect(somes.account.registerPushToken).toHaveBeenCalledWith(TOKEN, 'android')
    );

    // the echo of the read above, then a second one — an unguarded listener turns
    // these into an endless round of exp.host reads and backend upserts
    await emitDeviceToken(DEVICE_TOKEN);
    await emitDeviceToken(DEVICE_TOKEN);

    expect(somes.account.registerPushToken).toHaveBeenCalledTimes(1);
    expect(getExpoPushToken).toHaveBeenCalledTimes(2);
  });

  it('still re-registers when the os actually rotates the token', async () => {
    await render(<PushRegistrar />, { wrapper: createWrapper() });

    await waitFor(() => expect(somes.account.registerPushToken).toHaveBeenCalledTimes(1));
    await emitDeviceToken(DEVICE_TOKEN);

    // a rotation invalidates the expo token built on top of the device one
    (getExpoPushToken as jest.Mock).mockResolvedValue({ status: 'ok', token: ROTATED });
    await emitDeviceToken('fcm-device-token-rotated');

    expect(somes.account.registerPushToken).toHaveBeenCalledWith(ROTATED, 'android');
    expect(somes.account.registerPushToken).toHaveBeenCalledTimes(2);
  });
});
