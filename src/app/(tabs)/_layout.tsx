import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/layout/app-header';
import { AppTabBar } from '@/components/layout/tab-bar';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: colors.screen },
      }}>
      <Tabs.Screen name="index" options={{ title: t('common:tabs.home') }} />
      <Tabs.Screen name="abstimmungen" options={{ title: t('common:tabs.abstimmungen') }} />
      <Tabs.Screen name="abgeordnete" options={{ title: t('common:tabs.abgeordnete') }} />
      <Tabs.Screen name="profil" options={{ title: t('common:tabs.profil') }} />
    </Tabs>
  );
}
