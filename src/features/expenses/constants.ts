import type { Ionicons } from '@expo/vector-icons';

import type { CategoriaGasto } from '@/types/database';

export const categoriaLabels: Record<CategoriaGasto, string> = {
  medicamento: 'Medicamentos',
  otro: 'Otros',
};

export const categoriaIcons: Record<CategoriaGasto, keyof typeof Ionicons.glyphMap> = {
  medicamento: 'medkit-outline',
  otro: 'bag-handle-outline',
};

export const categoriaTabs: { key: CategoriaGasto; label: string }[] = [
  { key: 'medicamento', label: 'Medicamentos' },
  { key: 'otro', label: 'Otros' },
];

export function isCategoria(value: unknown): value is CategoriaGasto {
  return value === 'medicamento' || value === 'otro';
}

/**
 * Formato de pesos chilenos: 12990 → "$12.990".
 * Se arma a mano para no depender del soporte de Intl.NumberFormat en cada dispositivo.
 */
export function formatCLP(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits}`;
}
