import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar } from '@/components/ui/avatar';

describe('Avatar', () => {
  it('renders the portrait image by default', async () => {
    await render(<Avatar uri="https://example.com/portrait.jpg" size={40} />);

    const image = screen.getByTestId('avatar-image');
    expect(image.props.source).toEqual([{ uri: 'https://example.com/portrait.jpg' }]);
    expect(screen.queryByTestId('avatar-fallback')).toBeNull();
  });

  it('falls back to a person glyph once the image fails to load', async () => {
    await render(<Avatar uri="https://example.com/missing.jpg" size={40} />);

    await fireEvent(screen.getByTestId('avatar-image'), 'error', {
      nativeEvent: { error: 'not found' },
    });

    expect(screen.getByTestId('avatar-fallback')).toBeTruthy();
    expect(screen.queryByTestId('avatar-image')).toBeNull();
  });
});
