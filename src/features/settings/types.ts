import type { ThemePreference } from '@/theme';

export type AppSettings = {
  themePreference: ThemePreference;
  /** Umbral por defecto al crear ítems nuevos de inventario. */
  lowStockThreshold: number;
  medicationRemindersEnabled: boolean;
};
