import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSheet } from '@/components/layout/language-sheet';
import { AccountCard } from '@/components/profile/account-card';
import { DangerZoneCard } from '@/components/profile/danger-zone-card';
import { FavoritesLinkCards } from '@/components/profile/favorites-link-card';
import { InterestsCard } from '@/components/profile/interests-card';
import { Card } from '@/components/ui/card';
import { Screen, ScreenTitle } from '@/components/ui/screen';
import { useAuth } from '@/lib/use-auth';
import { useLocale, useSwitchLocale } from '@/lib/use-locale';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';
import { typography } from '@/theme/typography';

export default function ProfilScreen() {
  const { t } = useTranslation('profile');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const locale = useLocale();
  const switchLocale = useSwitchLocale();
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);

  const localeCaptionKey = locale === 'de-AT' ? 'common:languageSheet.deAT.title' : 'common:languageSheet.enGB.title';

  return (
    <Screen>
      <ScreenTitle title={t('screenTitle.title')} subtitle={t('screenTitle.subtitle')} />

      <AccountCard />

      <Card onPress={() => setShowLanguageSheet(true)}>
        <View style={styles.link}>
          <Ionicons name="language-outline" size={22} color={colors.accent} />
          <View style={styles.linkText}>
            <Text style={typography.cardHeading}>{t('common:languageSheet.title')}</Text>
            <Text style={typography.caption}>{t(localeCaptionKey)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </Card>

      {isAuthenticated ? (
        <>
          <InterestsCard />
          <FavoritesLinkCards />

          <Card onPress={() => router.navigate('/notifications')}>
            <View style={styles.link}>
              <Ionicons name="notifications-outline" size={22} color={colors.accent} />
              <View style={styles.linkText}>
                <Text style={typography.cardHeading}>{t('notifications.title')}</Text>
                <Text style={typography.caption}>{t('notifications.caption')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Card>

          <DangerZoneCard />
        </>
      ) : (
        <Card style={styles.blurbCard}>
          <Text style={typography.cardHeading}>{t('guestBlurb.title')}</Text>
          <View style={styles.benefits}>
            {BENEFIT_KEYS.map((key) => (
              <View key={key} style={styles.benefit}>
                <Ionicons name="checkmark" size={16} color={colors.accent} />
                <Text style={[typography.bodyMuted, styles.benefitLabel]}>
                  {t(`guestBlurb.benefits.${key}`)}
                </Text>
              </View>
            ))}
          </View>

          <Text style={typography.caption}>{t('guestBlurb.noAccountNote')}</Text>
        </Card>
      )}

      <LanguageSheet
        visible={showLanguageSheet}
        value={locale}
        onChange={switchLocale}
        onClose={() => setShowLanguageSheet(false)}
      />
    </Screen>
  );
}

const BENEFIT_KEYS = ['interests', 'favorites', 'sync'] as const;

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkText: {
    flex: 1,
    gap: 2,
  },
  blurbCard: {
    gap: spacing.md,
  },
  benefits: {
    gap: spacing.sm,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitLabel: {
    flex: 1,
  },
});
