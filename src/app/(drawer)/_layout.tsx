import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navItems } from '@/components/navigation/navItems';
import { SideRail } from '@/components/navigation/SideRail';
import { useReminderSync } from '@/features/medications/hooks/useReminderSync';
import { onNotificationOpened } from '@/features/medications/services/notificationService';
import { getSidebarWidth, SidebarWidthContext } from '@/lib/layout';
import { useTheme } from '@/theme';

export default function SidebarLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useReminderSync();

  // Al tocar una notificación de medicamento, abrimos el inicio con las tomas del día
  useEffect(() => onNotificationOpened(() => router.navigate('/')), []);

  return (
    // Las pantallas calculan su ancho útil descontando la barra lateral
    <SidebarWidthContext.Provider value={getSidebarWidth(width) + insets.left}>
      <Tabs
        tabBar={(props) => <SideRail {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarPosition: 'left',
          sceneStyle: { backgroundColor: colors.background },
        }}>
        {navItems.map((item) => (
          <Tabs.Screen key={item.route} name={item.route} options={{ title: item.label }} />
        ))}
      </Tabs>
    </SidebarWidthContext.Provider>
  );
}
