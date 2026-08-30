import { SubScreen } from '@/components/layout/sub-screen';
import { Card } from '@/components/ui/card';
import { ComingSoon } from '@/components/ui/coming-soon';
import { ScreenTitle } from '@/components/ui/screen';

export default function NotificationsScreen() {
  return (
    <SubScreen>
      <ScreenTitle title="Benachrichtigungen" />

      <Card>
        <ComingSoon
          icon="notifications-outline"
          title="Noch nicht verfügbar"
          description="Push-Notifications sind noch in Entwicklung."
        />
      </Card>
    </SubScreen>
  );
}
