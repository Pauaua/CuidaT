import { Pressable, Switch, View } from 'react-native';

import { AppText, Button, Card, Header, Screen, SegmentedTabs } from '@/components/ui';
import { APP_CONFIG } from '@/config/app';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { ensureNotificationPermission } from '@/features/medications/services/notificationService';
import {
  isExpoGoAndroid,
  notificationsSupported,
} from '@/features/medications/services/notificationsModule';
import { useSettings } from '@/features/settings/hooks/SettingsProvider';
import { confirmAction } from '@/lib/confirm';
import { useTheme, type ThemePreference } from '@/theme';

const themeTabs: { key: ThemePreference; label: string }[] = [
  { key: 'system', label: 'Automático' },
  { key: 'light', label: 'Claro' },
  { key: 'dark', label: 'Oscuro' },
];

export default function SettingsScreen() {
  const { colors, spacing, touchTarget } = useTheme();
  const { settings, updateSettings } = useSettings();
  const signOut = useSignOut();

  const toggleReminders = async (enabled: boolean) => {
    if (enabled) await ensureNotificationPermission();
    updateSettings({ medicationRemindersEnabled: enabled });
  };

  const changeThreshold = (delta: number) =>
    updateSettings({ lowStockThreshold: Math.max(0, Math.min(99, settings.lowStockThreshold + delta)) });

  return (
    <Screen>
      <Header title="Configuración" />
      <View style={{ gap: spacing.lg }}>
        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.md }}>
            Apariencia
          </AppText>
          <SegmentedTabs
            tabs={themeTabs}
            active={settings.themePreference}
            onChange={(themePreference) => updateSettings({ themePreference })}
          />
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.sm }}>
            Para agrandar la letra, usa el tamaño de texto de tu teléfono: la app se adapta sola.
          </AppText>
        </Card>

        <Card>
          <Pressable
            onPress={() => toggleReminders(!settings.medicationRemindersEnabled)}
            accessibilityRole="switch"
            accessibilityState={{ checked: settings.medicationRemindersEnabled }}
            accessibilityLabel="Recordatorios de medicamentos"
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget }}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle">Recordatorios de medicamentos</AppText>
              <AppText color="textMuted">Te avisamos a la hora de cada toma.</AppText>
              {!notificationsSupported ? (
                <AppText variant="caption" color="dangerText" style={{ marginTop: spacing.xxs }}>
                  {isExpoGoAndroid
                    ? 'No disponibles en Expo Go para Android. Funcionan al instalar la app (development build).'
                    : 'No disponibles en esta plataforma.'}
                </AppText>
              ) : null}
            </View>
            <Switch
              value={settings.medicationRemindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
              importantForAccessibility="no"
            />
          </Pressable>
        </Card>

        <Card>
          <AppText variant="subtitle">Aviso de stock bajo</AppText>
          <AppText color="textMuted" style={{ marginBottom: spacing.md }}>
            Valor sugerido al crear un ítem nuevo en el inventario.
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Button title="−" variant="secondary" onPress={() => changeThreshold(-1)} accessibilityLabel="Bajar umbral" />
            <AppText variant="title" accessibilityLiveRegion="polite" accessibilityLabel={`${settings.lowStockThreshold} unidades`}>
              {settings.lowStockThreshold}
            </AppText>
            <Button title="+" variant="secondary" onPress={() => changeThreshold(1)} accessibilityLabel="Subir umbral" />
            <AppText color="textMuted">unidades</AppText>
          </View>
        </Card>

        <Card>
          <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>
            Cuenta
          </AppText>
          <Button
            title="Cerrar sesión"
            variant="danger"
            icon="log-out-outline"
            loading={signOut.isPending}
            onPress={() =>
              confirmAction('¿Cerrar sesión?', 'Tus datos quedan guardados en tu cuenta.', () => signOut.mutate(), 'Cerrar sesión')
            }
          />
        </Card>

        <AppText variant="caption" color="textMuted" align="center">
          {APP_CONFIG.name} · {APP_CONFIG.tagline}
        </AppText>
      </View>
    </Screen>
  );
}
