import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import type { ReactNode } from 'react';

import { PushRouter } from '@/components/push-router';
import { getCountry, setCountry } from '@/lib/somes';

jest.mock('expo-notifications', () => ({
  __esModule: true,
  useLastNotificationResponse: jest.fn(),
}));

const mockPush = jest.fn();
/** undefined is what the hook returns before the navigator can accept a push */
let mockNavigationState: { key: string } | undefined;

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush }),
  useRootNavigationState: () => mockNavigationState,
}));

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  getCountry: jest.fn(),
  setCountry: jest.fn(),
}));

const VOTE = { type: 'vote', country: 'at', gp: 'XXVIII', ityp: 'A', inr: 123 };

function responseWith(data: unknown, identifier = 'notif-1') {
  return { notification: { request: { identifier, content: { data } } } };
}

function setResponse(response: unknown) {
  (Notifications.useLastNotificationResponse as jest.Mock).mockReturnValue(response);
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

/** the effect opens the target in an async function, let it settle before asserting */
async function settle() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigationState = { key: 'root' };
  (getCountry as jest.Mock).mockReturnValue('at');
  (setCountry as jest.Mock).mockResolvedValue(undefined);
  setResponse(null);
});

it('opens the screen a vote notification points at', async () => {
  setResponse(responseWith(VOTE));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();

  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/abstimmung/[gp]/[ityp]/[inr]',
    params: { gp: 'XXVIII', ityp: 'A', inr: '123' },
  });
});

it('opens a decree notification on the decree screen', async () => {
  setResponse(responseWith({ type: 'decree', country: 'at', ris_id: 'BGBLA_2025_II_1' }));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();

  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/verordnung/[risId]',
    params: { risId: 'BGBLA_2025_II_1' },
  });
});

it('navigates once even though the hook keeps replaying the response', async () => {
  setResponse(responseWith(VOTE));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();
  await screen.rerender(<PushRouter />);
  await settle();

  expect(mockPush).toHaveBeenCalledTimes(1);
});

it('waits for the navigator before opening a cold start response', async () => {
  mockNavigationState = undefined;
  setResponse(responseWith(VOTE));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();
  expect(mockPush).not.toHaveBeenCalled();

  mockNavigationState = { key: 'root' };
  await screen.rerender(<PushRouter />);
  await settle();

  expect(mockPush).toHaveBeenCalledTimes(1);
});

it('switches region before navigating when the target is from the other one', async () => {
  setResponse(responseWith({ type: 'delegate', country: 'eu', id: 7 }));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();

  expect(setCountry).toHaveBeenCalledWith('eu');
  expect(mockPush).toHaveBeenCalledWith({ pathname: '/abgeordnete/[id]', params: { id: '7' } });
});

it('leaves the region alone when the target is already in it', async () => {
  setResponse(responseWith(VOTE));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();

  expect(setCountry).not.toHaveBeenCalled();
});

it('ignores a payload it cannot read rather than navigating somewhere wrong', async () => {
  setResponse(responseWith({ type: 'petition', country: 'at', id: 1 }));

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();

  expect(mockPush).not.toHaveBeenCalled();
});

it('does nothing when the app was not opened from a notification', async () => {
  setResponse(null);

  await render(<PushRouter />, { wrapper: createWrapper() });
  await settle();

  expect(mockPush).not.toHaveBeenCalled();
});
