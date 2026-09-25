import { Platform } from 'react-native';

import { APP_CONFIG } from '@/config/app';
import { normalizeTime } from '@/lib/dates';
import type { Medicamento } from '@/types/database';

import { getNotifications } from './notificationsModule';

/**
 * Recordatorios locales de medicamentos.
 * Cada hora de toma es una notificación diaria con identificador
 * `med-<id>-<HHMM>`, lo que permite cancelarlas sin guardar estado extra.
 * Si las notificaciones no están disponibles (web o Expo Go en Android),
 * todas las funciones terminan sin hacer nada.
 */

const PREFIX = 'med-';

export function configureNotifications(): void {
  const Notifications = getNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(APP_CONFIG.medicationChannelId, {
      name: 'Recordatorios de medicamentos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Ejecuta `onOpen` cuando la persona toca una notificación. Devuelve la función para limpiar. */
export function onNotificationOpened(onOpen: () => void): () => void {
  const Notifications = getNotifications();
  if (!Notifications) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener(onOpen);
  return () => sub.remove();
}

function reminderId(medicationId: string, time: string): string {
  return `${PREFIX}${medicationId}-${normalizeTime(time).replace(':', '')}`;
}

async function cancelWhere(match: (identifier: string) => boolean): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => match(n.identifier))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function cancelMedicationReminders(medicationId: string): Promise<void> {
  await cancelWhere((id) => id.startsWith(`${PREFIX}${medicationId}-`));
}

export async function cancelAllMedicationReminders(): Promise<void> {
  await cancelWhere((id) => id.startsWith(PREFIX));
}

/** Reprograma todas las tomas de un medicamento. */
export async function scheduleMedicationReminders(
  medication: Medicamento,
  personName: string
): Promise<void> {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await cancelMedicationReminders(medication.id);

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const uniqueTimes = [...new Set(medication.horas_toma.map(normalizeTime))];

  await Promise.all(
    uniqueTimes.map((time) => {
      const [hour = 0, minute = 0] = time.split(':').map(Number);
      return Notifications.scheduleNotificationAsync({
        identifier: reminderId(medication.id, time),
        content: {
          title: `Hora del medicamento de ${personName}`,
          body: `${medication.nombre} · ${medication.dosis} (${time})`,
          data: { medicationId: medication.id, time },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: APP_CONFIG.medicationChannelId,
        },
      });
    })
  );
}

/** Deja los recordatorios del dispositivo alineados con la base de datos. */
export async function syncAllMedicationReminders(
  medications: Medicamento[],
  personNames: Map<string, string>
): Promise<void> {
  if (!getNotifications()) return;
  await cancelAllMedicationReminders();
  for (const medication of medications) {
    await scheduleMedicationReminders(
      medication,
      personNames.get(medication.persona_cuidada_id) ?? 'tu ser querido'
    );
  }
}
