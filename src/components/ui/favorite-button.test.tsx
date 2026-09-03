import { fireEvent, render, screen } from '@testing-library/react-native';

import { FavoriteButton } from '@/components/ui/favorite-button';
import { useFavorite } from '@/lib/favorites';
import { useAuth } from '@/lib/use-auth';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/use-auth', () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock('@/lib/favorites', () => ({
  __esModule: true,
  useFavorite: jest.fn(),
}));

function mockAuth(isAuthenticated: boolean) {
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated });
}

function mockFavorite(overrides: Partial<ReturnType<typeof useFavorite>>) {
  (useFavorite as jest.Mock).mockReturnValue({
    isFavorite: false,
    isReady: true,
    isPending: false,
    toggle: jest.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FavoriteButton, signed out', () => {
  it('routes to anmelden instead of toggling, and labels itself for sign-in', async () => {
    mockAuth(false);
    const toggle = jest.fn();
    mockFavorite({ toggle });

    await render(<FavoriteButton kind="delegate" id={42} />);

    const button = screen.getByRole('button', { name: 'Anmelden, um zu favorisieren' });
    fireEvent.press(button);

    expect(mockPush).toHaveBeenCalledWith('/anmelden');
    expect(toggle).not.toHaveBeenCalled();
  });
});

describe('FavoriteButton, signed in', () => {
  it('toggles and reads as "hinzufügen" when not yet a favorite', async () => {
    mockAuth(true);
    const toggle = jest.fn();
    mockFavorite({ isFavorite: false, toggle });

    await render(<FavoriteButton kind="delegate" id={42} />);

    const button = screen.getByRole('button', { name: 'Zu Favoriten hinzufügen' });
    expect(button.props.accessibilityState.selected).toBe(false);

    fireEvent.press(button);

    expect(toggle).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('reads as "entfernen" and marks itself selected when already a favorite', async () => {
    mockAuth(true);
    mockFavorite({ isFavorite: true });

    await render(<FavoriteButton kind="delegate" id={42} />);

    const button = screen.getByRole('button', { name: 'Aus Favoriten entfernen' });
    expect(button.props.accessibilityState.selected).toBe(true);
  });

  it('disables itself while id is null, a mutation is pending, or the list has not loaded', async () => {
    mockAuth(true);
    mockFavorite({ isReady: false });

    await render(<FavoriteButton kind="delegate" id={42} />);
    expect(screen.getByRole('button').props.accessibilityState.disabled).toBe(true);

    await screen.unmount();
    mockFavorite({ isPending: true });
    await render(<FavoriteButton kind="delegate" id={42} />);
    expect(screen.getByRole('button').props.accessibilityState.disabled).toBe(true);

    await screen.unmount();
    mockFavorite({});
    await render(<FavoriteButton kind="delegate" id={null} />);
    expect(screen.getByRole('button').props.accessibilityState.disabled).toBe(true);
  });
});
