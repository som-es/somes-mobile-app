import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { DEFAULT_INFO_DAYS, DELEGATE_FAVO_KEY, VOTE_FAVO_KEY, useFavorite } from '@/lib/favorites';
import { somes } from '@/lib/somes';

jest.mock('@/lib/use-auth', () => ({
  __esModule: true,
  useAuth: jest.fn(() => ({ isAuthenticated: true })),
}));

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  somes: {
    account: {
      bookmarkedDelegates: jest.fn(),
      addDelegateBookmark: jest.fn(),
      removeDelegateBookmark: jest.fn(),
      updateDelegateBookmark: jest.fn(),
      bookmarkedVoteResults: jest.fn(),
      addVoteResultBookmark: jest.fn(),
      removeVoteResultBookmark: jest.fn(),
    },
  },
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

// invalidateQueries triggers a background refetch whose result reaches React via a
// notifyManager macrotask; without draining it before the test ends, it fires after
// the tree is torn down and corrupts every render in the tests that follow.
async function flushPendingQueryEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  jest.clearAllMocks();
  (somes.account.bookmarkedDelegates as jest.Mock).mockResolvedValue([]);
  (somes.account.bookmarkedVoteResults as jest.Mock).mockResolvedValue([]);
});

describe('useFavorite (delegate)', () => {
  it('optimistically adds the item to the cache before the mutation resolves', async () => {
    const client = createTestQueryClient();
    client.setQueryData(DELEGATE_FAVO_KEY, []);
    const add = deferred<void>();
    (somes.account.addDelegateBookmark as jest.Mock).mockReturnValue(add.promise);

    const { result } = await renderHook(() => useFavorite('delegate', 42), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.isFavorite).toBe(false);

    await act(() => {
      result.current.toggle();
    });

    await waitFor(() =>
      expect(client.getQueryData(DELEGATE_FAVO_KEY)).toEqual([
        { delegate_id: 42, user_info_days: DEFAULT_INFO_DAYS },
      ])
    );
    expect(somes.account.addDelegateBookmark).toHaveBeenCalledWith({
      delegate_id: 42,
      user_info_days: DEFAULT_INFO_DAYS,
    });

    await act(() => {
      add.resolve();
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    await flushPendingQueryEffects();
  });

  it('optimistically removes an already-favorited item', async () => {
    const client = createTestQueryClient();
    const favorited = [{ delegate_id: 42, user_info_days: 7 }];
    client.setQueryData(DELEGATE_FAVO_KEY, favorited);
    (somes.account.bookmarkedDelegates as jest.Mock).mockResolvedValue(favorited);
    const remove = deferred<void>();
    (somes.account.removeDelegateBookmark as jest.Mock).mockReturnValue(remove.promise);

    const { result } = await renderHook(() => useFavorite('delegate', 42), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    await act(() => {
      result.current.toggle();
    });

    expect(client.getQueryData(DELEGATE_FAVO_KEY)).toEqual([]);

    await act(() => {
      remove.resolve();
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(somes.account.removeDelegateBookmark).toHaveBeenCalledWith({
      delegate_id: 42,
      user_info_days: DEFAULT_INFO_DAYS,
    });

    await flushPendingQueryEffects();
  });

  it('rolls back the optimistic update when the mutation rejects', async () => {
    const client = createTestQueryClient();
    const previous = [{ delegate_id: 1, user_info_days: 7 }];
    client.setQueryData(DELEGATE_FAVO_KEY, previous);
    (somes.account.bookmarkedDelegates as jest.Mock).mockResolvedValue(previous);
    const add = deferred<void>();
    (somes.account.addDelegateBookmark as jest.Mock).mockReturnValue(add.promise);

    const { result } = await renderHook(() => useFavorite('delegate', 42), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    await act(() => {
      result.current.toggle();
    });

    await waitFor(() =>
      expect(client.getQueryData(DELEGATE_FAVO_KEY)).toEqual([
        ...previous,
        { delegate_id: 42, user_info_days: DEFAULT_INFO_DAYS },
      ])
    );

    await act(() => {
      add.reject(new Error('network error'));
    });

    await waitFor(() => expect(client.getQueryData(DELEGATE_FAVO_KEY)).toEqual(previous));
    await waitFor(() => expect(result.current.isPending).toBe(false));

    await flushPendingQueryEffects();
  });

  it('does not call the mutation when id is null', async () => {
    const client = createTestQueryClient();
    client.setQueryData(DELEGATE_FAVO_KEY, []);

    const { result } = await renderHook(() => useFavorite('delegate', null), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    await act(() => {
      result.current.toggle();
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(somes.account.addDelegateBookmark).not.toHaveBeenCalled();
    expect(somes.account.removeDelegateBookmark).not.toHaveBeenCalled();

    await flushPendingQueryEffects();
  });
});

describe('useFavorite (vote)', () => {
  it('optimistically adds a vote favorite under its own cache key', async () => {
    const client = createTestQueryClient();
    client.setQueryData(VOTE_FAVO_KEY, []);
    const add = deferred<void>();
    (somes.account.addVoteResultBookmark as jest.Mock).mockReturnValue(add.promise);

    const { result } = await renderHook(() => useFavorite('vote', 7), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    await act(() => {
      result.current.toggle();
    });

    expect(client.getQueryData(VOTE_FAVO_KEY)).toEqual([{ vote_result_id: 7 }]);
    expect(somes.account.addVoteResultBookmark).toHaveBeenCalledWith({ vote_result_id: 7 });

    await act(() => {
      add.resolve();
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    await flushPendingQueryEffects();
  });
});
