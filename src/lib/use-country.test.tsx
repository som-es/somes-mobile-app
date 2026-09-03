import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { getCountry, setCountry, subscribeToCountry } from '@/lib/somes';
import { useCountry, useSwitchCountry } from '@/lib/use-country';

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  getCountry: jest.fn(),
  setCountry: jest.fn(),
  subscribeToCountry: jest.fn(),
}));

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

beforeEach(() => {
  jest.clearAllMocks();
  (subscribeToCountry as jest.Mock).mockReturnValue(() => {});
});

describe('useCountry', () => {
  it('reads the current country from the store', async () => {
    (getCountry as jest.Mock).mockReturnValue('eu');

    const { result } = await renderHook(() => useCountry(), {
      wrapper: createWrapper(createTestQueryClient()),
    });

    expect(result.current).toBe('eu');
  });
});

describe('useSwitchCountry', () => {
  it('persists the chosen country and resets every query, so mounted screens refetch without remounting', async () => {
    const client = createTestQueryClient();
    const resetSpy = jest.spyOn(client, 'resetQueries');
    const { result } = await renderHook(() => useSwitchCountry(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await result.current('eu');
    });

    expect(setCountry).toHaveBeenCalledWith('eu');
    expect(resetSpy).toHaveBeenCalled();
  });
});
