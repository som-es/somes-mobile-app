import { fireEvent, render, screen } from '@testing-library/react-native';

import { AppHeader } from '@/components/layout/app-header';

/** the header pads itself by the top inset and the real hook throws outside a
    provider, which also costs an extra render pass per test */
jest.mock('react-native-safe-area-context', () => ({
  __esModule: true,
  useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
let mockPathname = '/';

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
  usePathname: () => mockPathname,
}));

// the flags are .svg imports, which metro turns into components and jest does not,
// and the country sheet is always mounted and animates on entry. the bell is what is
// under test here, so stub both out
jest.mock('@/components/ui/country-flag', () => ({
  __esModule: true,
  CountryFlag: () => null,
}));

jest.mock('@/components/layout/country-sheet', () => ({
  __esModule: true,
  CountrySheet: () => null,
}));

jest.mock('@/lib/use-country', () => ({
  __esModule: true,
  useCountry: jest.fn(() => 'at'),
  useSwitchCountry: jest.fn(() => jest.fn()),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockPathname = '/';
});

describe('AppHeader, notifications bell', () => {
  it('navigates to the notifications screen from another route', async () => {
    await render(<AppHeader />);

    const bell = screen.getByRole('button', { name: 'Benachrichtigungen' });
    expect(bell.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(bell);

    expect(mockNavigate).toHaveBeenCalledWith('/notifications');
    // it has to be navigate: a NAVIGATE action reuses the route when it is already on
    // top, so a second tap landing before the guard re-renders cannot stack a second
    // copy. push has no such dedupe, which is the bug this replaced.
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('goes inert on the notifications screen instead of stacking another copy', async () => {
    mockPathname = '/notifications';
    await render(<AppHeader />);

    const bell = screen.getByRole('button', { name: 'Benachrichtigungen' });
    expect(bell.props.accessibilityState.disabled).toBe(true);
    expect(bell.props.accessibilityState.selected).toBe(true);

    fireEvent.press(bell);

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
