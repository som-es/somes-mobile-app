import { ApiError } from '@som-es/somes-ts';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getCountry,
  isAuthError,
  isRateLimited,
  loadCountry,
  setCountry,
  signUpFlags,
  subscribeToCountry,
} from '@/lib/somes';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('isAuthError', () => {
  it('is true for an ApiError with errorType AuthError', () => {
    expect(isAuthError(new ApiError('nope', 400, 'AuthError', '', null))).toBe(true);
  });

  it('is false for a different errorType', () => {
    expect(isAuthError(new ApiError('nope', 400, 'SignUpError', '', null))).toBe(false);
  });

  it('is false for a non-ApiError value', () => {
    expect(isAuthError(new Error('nope'))).toBe(false);
    expect(isAuthError(null)).toBe(false);
  });
});

describe('isRateLimited', () => {
  it('is true for a 429 ApiError', () => {
    expect(isRateLimited(new ApiError('slow down', 429, 'RateLimit', '', null))).toBe(true);
  });

  it('is false for any other status', () => {
    expect(isRateLimited(new ApiError('nope', 400, 'RateLimit', '', null))).toBe(false);
  });

  it('is false for a non-ApiError value', () => {
    expect(isRateLimited(new Error('nope'))).toBe(false);
  });
});

describe('signUpFlags', () => {
  it('returns meta for a SignUpError with meta set', () => {
    const meta = { emailTaken: true };
    expect(signUpFlags(new ApiError('nope', 400, 'SignUpError', '', meta))).toBe(meta);
  });

  it('returns null when errorType is not SignUpError', () => {
    expect(signUpFlags(new ApiError('nope', 400, 'AuthError', '', { emailTaken: true }))).toBeNull();
  });

  it('returns null when meta is falsy', () => {
    expect(signUpFlags(new ApiError('nope', 400, 'SignUpError', '', null))).toBeNull();
  });

  it('returns null for a non-ApiError value', () => {
    expect(signUpFlags(new Error('nope'))).toBeNull();
  });
});

describe('country', () => {
  afterEach(async () => {
    // leave the module in its default state for the next test
    await setCountry('at');
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('defaults to at', () => {
    expect(getCountry()).toBe('at');
  });

  it('persists the new country and notifies subscribers', async () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToCountry(listener);

    await setCountry('eu');

    expect(getCountry()).toBe('eu');
    expect(listener).toHaveBeenCalledWith('eu');
    expect(await AsyncStorage.getItem('somes.country')).toBe('eu');

    unsubscribe();
  });

  it('is a no-op when setting the already-current country', async () => {
    const listener = jest.fn();
    subscribeToCountry(listener);

    await setCountry('at');

    expect(listener).not.toHaveBeenCalled();
  });

  it('loadCountry applies a previously persisted country', async () => {
    await AsyncStorage.setItem('somes.country', 'eu');

    const result = await loadCountry();

    expect(result).toBe('eu');
    expect(getCountry()).toBe('eu');
  });

  it('loadCountry ignores an invalid stored value', async () => {
    await AsyncStorage.setItem('somes.country', 'de');

    const result = await loadCountry();

    expect(result).toBe('at');
    expect(getCountry()).toBe('at');
  });
});
