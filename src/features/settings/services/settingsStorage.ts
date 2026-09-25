import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_CONFIG } from '@/config/app';

import type { AppSettings } from '../types';

const STORAGE_KEY = 'app-settings-v1';

export const defaultSettings: AppSettings = {
  themePreference: 'system',
  lowStockThreshold: APP_CONFIG.defaultLowStockThreshold,
  medicationRemindersEnabled: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
