import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useFavorite, type FavoriteKind } from '@/lib/favorites';
import { useAuth } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';

type Props = {
  kind: FavoriteKind;
  id: number | null;
  size?: number;
};

/** signed out it stays visible and routes to anmelden instead of hiding */
export function FavoriteButton({ kind, id, size = 22 }: Props) {
  const { t } = useTranslation('favorites');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isFavorite, isReady, isPending, toggle } = useFavorite(kind, id);

  const label = isFavorite ? t('remove') : t('add');

  return (
    <Pressable
      onPress={() => (isAuthenticated ? toggle() : router.push('/anmelden'))}
      disabled={id === null || isPending || (isAuthenticated && !isReady)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={isAuthenticated ? label : t('signInPrompt')}
      accessibilityState={{ selected: isFavorite }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? colors.accent : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
});
