/**
 * Configuración central de la app.
 * Cambia el nombre aquí y se actualiza en todas las pantallas.
 */
export const APP_CONFIG = {
  name: 'CuidApp',
  tagline: 'Cuidar también es cuidarte',
  locale: 'es-CL',
  /** Umbral por defecto para considerar que un ítem del inventario está bajo. */
  defaultLowStockThreshold: 5,
  /** Canal de Android para los recordatorios de medicamentos. */
  medicationChannelId: 'medicamentos',
} as const;

export const APP_NAME = APP_CONFIG.name;
