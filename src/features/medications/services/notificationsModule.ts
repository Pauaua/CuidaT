import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Desde el SDK 53, Expo Go en Android no incluye expo-notifications:
 * solo importarlo lanza un error. Ahí la app funciona sin recordatorios,
 * y con una development build (o en iOS) se activan normalmente.
 */
export const isExpoGoAndroid =
  Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const notificationsSupported = Platform.OS !== 'web' && !isExpoGoAndroid;

let cached: NotificationsModule | null = null;

/** Carga expo-notifications solo donde está disponible; si no, devuelve null. */
export function getNotifications(): NotificationsModule | null {
  if (!notificationsSupported) return null;
  if (!cached) {
    // require diferido: evita que el import falle en Expo Go (Android)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as NotificationsModule;
  }
  return cached;
}
