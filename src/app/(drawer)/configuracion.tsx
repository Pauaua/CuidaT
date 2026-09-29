import { Alert, Pressable, Switch, View } from 'react-native';

import { AppText, Button, Card, Header, Screen, SegmentedTabs } from '@/components/ui';
import { APP_CONFIG } from '@/config/app';
import { useSignOut } from '@/features/auth/hooks/useAuthActions';
import { ensureNotificationPermission } from '@/features/medications/services/notificationService';
import {
  isExpoGoAndroid,
  notificationsSupported,
} from '@/features/medications/services/notificationsModule';
import { useDeleteAccount, usePauseAccount } from '@/features/profile/hooks/useAccountActions';
import { useProfile } from '@/features/profile/hooks/useProfile';
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
  const profile = useProfile();
  const pause = usePauseAccount();
  const remove = useDeleteAccount();

  const onPause = () =>
    confirmAction(
      '¿Pausar tu cuenta?',
      'Dejaremos de enviarte recordatorios de medicamentos hasta que la reactives. Toda tu información queda guardada.',
      () =>
        profile.data &&
        pause.mutate(profile.data.id, {
          onError: (e) => Alert.alert('No pudimos pausar tu cuenta', e.message),
        }),
      'Pausar'
    );

  // Doble confirmación: es una acción que no se puede deshacer
  const onDelete = () =>
    confirmAction(
      '¿Eliminar tu cuenta?',
      'Se borrará para siempre tu perfil y todo lo que registraste: personas cuidadas, medicamentos, inventario, registros, servicios y agenda.',
      () =>
        confirmAction(
          '¿Confirmas que quieres eliminarla?',
          'Esta acción no se puede deshacer. Si solo necesitas un descanso, puedes pausar tu cuenta.',
          () =>
            remove.mutate(undefined, {
              onError: (e) => Alert.alert('No pudimos eliminar tu cuenta', e.message),
            }),
          'Eliminar para siempre'
        ),
      'Continuar'
    );

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
          <View style={{ gap: spacing.sm }}>
            <Button
              title="Cerrar sesión"
              variant="secondary"
              icon="log-out-outline"
              fullWidth
              loading={signOut.isPending}
              onPress={() =>
                confirmAction('¿Cerrar sesión?', 'Tus datos quedan guardados en tu cuenta.', () => signOut.mutate(), 'Cerrar sesión')
              }
            />

            <Button
              title="Pausar cuenta"
              variant="secondary"
              icon="pause-outline"
              fullWidth
              loading={pause.isPending}
              onPress={onPause}
            />
            <AppText variant="caption" color="textMuted">
              Detiene los recordatorios mientras te tomas un respiro. Tus datos quedan guardados y
              puedes reactivarla cuando quieras.
            </AppText>

            <Button
              title="Eliminar cuenta"
              variant="danger"
              icon="trash-outline"
              fullWidth
              loading={remove.isPending}
              onPress={onDelete}
            />
            <AppText variant="caption" color="textMuted">
              Borra para siempre tu cuenta y toda tu información. No se puede deshacer.
            </AppText>
          </View>
        </Card>

        <AppText variant="caption" color="textMuted" align="center">
          {APP_CONFIG.name} · {APP_CONFIG.tagline}
        </AppText>
      </View>
    </Screen>
  );
}
