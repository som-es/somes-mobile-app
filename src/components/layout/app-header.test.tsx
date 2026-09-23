import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import '@/test/i18n';
import { AppHeader } from '@/components/layout/app-header';

/** the header pads itself by the top inset and the real hook throws outside a
    provider, which also costs an extra render pass per test */
jest.mock('react-native-safe-area-context', () => ({
  __esModule: true,
  useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
}));

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({ navigate: mockNavigate }),
  usePathname: () => '/',
}));

// the flag is an .svg import, which metro turns into a component and jest does not
jest.mock('@/components/ui/country-flag', () => ({
  __esModule: true,
  CountryFlag: () => null,
}));

const mockCountrySheet = jest.fn(() => null);
jest.mock('@/components/layout/country-sheet', () => ({
  __esModule: true,
  CountrySheet: (props: unknown) => mockCountrySheet(props),
}));

jest.mock('@/lib/use-country', () => ({
  __esModule: true,
  useCountry: jest.fn(() => 'at'),
  useSwitchCountry: jest.fn(() => jest.fn()),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AppHeader', () => {
  it('navigates home when the logo is pressed', async () => {
    await render(<AppHeader />);

    fireEvent.press(screen.getByRole('button', { name: 'somes — go to home' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('opens the country sheet when the region switcher is pressed', async () => {
    await render(<AppHeader />);

    expect(mockCountrySheet).toHaveBeenLastCalledWith(
      expect.objectContaining({ visible: false })
    );

    fireEvent.press(screen.getByRole('button', { name: 'Switch region, currently Austria' }));

    await waitFor(() =>
      expect(mockCountrySheet).toHaveBeenLastCalledWith(
        expect.objectContaining({ visible: true })
      )
    );
  });
});
