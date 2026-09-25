import type { Ionicons } from '@expo/vector-icons';

import type { SelectOption } from '@/components/ui';
import type { ItemInventario, TipoInventario } from '@/types/database';

export const tipoInventarioLabels: Record<TipoInventario, string> = {
  medicamento: 'Medicamento',
  insumo: 'Insumo',
  otro: 'Otro',
};

export const tipoInventarioIcons: Record<TipoInventario, keyof typeof Ionicons.glyphMap> = {
  medicamento: 'medkit-outline',
  insumo: 'bandage-outline',
  otro: 'cube-outline',
};

export const tipoInventarioOptions: SelectOption<TipoInventario>[] = [
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'insumo', label: 'Insumo (pañales, gasas, guantes…)' },
  { value: 'otro', label: 'Otro' },
];

export function isLowStock(item: Pick<ItemInventario, 'cantidad' | 'umbral_bajo'>): boolean {
  return item.cantidad <= item.umbral_bajo;
}
