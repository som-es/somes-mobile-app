import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/layout/app-header';
import { Screen } from '@/components/ui/screen';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

type Props = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function SubScreen({ children, refreshing, onRefresh }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader />
      <Screen refreshing={refreshing} onRefresh={onRefresh} tabBarSpacing={false}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={typography.subtitle}>{t('common:detail.back')}</Text>
        </Pressable>

        {children}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
