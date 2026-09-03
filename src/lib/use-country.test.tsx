import { renderHook } from '@testing-library/react-native';

import { getCountry, setCountry, subscribeToCountry } from '@/lib/somes';
import { useCountry, useSwitchCountry } from '@/lib/use-country';

jest.mock('@/lib/somes', () => ({
  __esModule: true,
  getCountry: jest.fn(),
  setCountry: jest.fn(),
  subscribeToCountry: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  (subscribeToCountry as jest.Mock).mockReturnValue(() => {});
});

describe('useCountry', () => {
  it('reads the current country from the store', async () => {
    (getCountry as jest.Mock).mockReturnValue('eu');

    const { result } = await renderHook(() => useCountry());

    expect(result.current).toBe('eu');
  });
});

describe('useSwitchCountry', () => {
  it('persists the chosen country', async () => {
    const { result } = await renderHook(() => useSwitchCountry());

    await result.current('eu');

    expect(setCountry).toHaveBeenCalledWith('eu');
  });
});
