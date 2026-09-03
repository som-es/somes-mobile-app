import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { clearToken, getToken, setToken, somes, subscribeToToken } from '@/lib/somes';
import { USER_QUERY_KEYS, useAuth, useExtendedUser, useSession } from '@/lib/use-auth';

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  getToken: jest.fn(),
  setToken: jest.fn(),
  clearToken: jest.fn(),
  subscribeToToken: jest.fn(),
  somes: { account: { me: jest.fn() } },
}));

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode(payload)}.sig`;
}

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const validPayload = {
  id: 1,
  sub: 'user@example.com',
  company: 'at',
  is_admin: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  (subscribeToToken as jest.Mock).mockReturnValue(() => {});
});

describe('useAuth', () => {
  it('is authenticated for a valid, non-expired token', async () => {
    const token = makeJwt({ ...validPayload, exp: Math.floor(Date.now() / 1000) + 3600 });
    (getToken as jest.Mock).mockReturnValue(token);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.sub).toBe('user@example.com');
  });

  it('is signed out for an expired token', async () => {
    const token = makeJwt({ ...validPayload, exp: Math.floor(Date.now() / 1000) - 3600 });
    (getToken as jest.Mock).mockReturnValue(token);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('is signed out and does not throw for a malformed token', async () => {
    (getToken as jest.Mock).mockReturnValue('not-a-jwt');

    const { result } = await renderHook(() => useAuth(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('is signed out when there is no token', async () => {
    (getToken as jest.Mock).mockReturnValue(null);

    const { result } = await renderHook(() => useAuth(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe('useSession', () => {
  it('signIn persists the token and invalidates every user query key', async () => {
    const client = createTestQueryClient();
    const invalidateSpy = jest.spyOn(client, 'invalidateQueries');
    const { result } = await renderHook(() => useSession(), { wrapper: createWrapper(client) });

    await act(async () => {
      await result.current.signIn('new-token');
    });

    expect(setToken).toHaveBeenCalledWith('new-token');
    expect(invalidateSpy).toHaveBeenCalledTimes(USER_QUERY_KEYS.length);
  });

  it('signOut clears the token and wipes the query cache', async () => {
    const client = createTestQueryClient();
    const clearSpy = jest.spyOn(client, 'clear');
    const { result } = await renderHook(() => useSession(), { wrapper: createWrapper(client) });

    await act(async () => {
      await result.current.signOut();
    });

    expect(clearToken).toHaveBeenCalled();
    expect(clearSpy).toHaveBeenCalled();
  });
});

describe('useExtendedUser', () => {
  it('does not fetch the account when signed out', async () => {
    (getToken as jest.Mock).mockReturnValue(null);

    const { result } = await renderHook(() => useExtendedUser(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(somes.account.me).not.toHaveBeenCalled();
  });

  it('fetches the account once signed in', async () => {
    const token = makeJwt({ ...validPayload, exp: Math.floor(Date.now() / 1000) + 3600 });
    (getToken as jest.Mock).mockReturnValue(token);
    (somes.account.me as jest.Mock).mockResolvedValue({ is_email_hashed: true });

    const { result } = await renderHook(() => useExtendedUser(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ is_email_hashed: true });
  });
});
