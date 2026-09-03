import { ApiError } from '@som-es/somes-ts';

import { isAuthError, isRateLimited, signUpFlags } from '@/lib/somes';

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
