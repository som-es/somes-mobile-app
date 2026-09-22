import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/lib/use-auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';

type Props = {
  delegateId: number;
  size?: number;
};

/** signed out it stays visible and routes to anmelden, same convention as FavoriteButton */
export function AskQuestionButton({ delegateId, size = 22 }: Props) {
  const { t } = useTranslation('questions');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <Pressable
      onPress={() =>
        router.push(
          isAuthenticated
            ? { pathname: '/frage/neu', params: { delegateId: String(delegateId) } }
            : '/anmelden'
        )
      }
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t('askButton')}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons name="chatbubble-outline" size={size} color={colors.textMuted} />
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
