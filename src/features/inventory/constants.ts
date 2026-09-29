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

export function unitsLabel(n: number): string {
  return `${n} ${n === 1 ? 'unidad' : 'unidades'}`;
}

/** Aviso al quedar poco stock tras dar una toma. */
export function stockAlertTitle(item: Pick<ItemInventario, 'nombre' | 'cantidad'>): string {
  return item.cantidad === 0 ? `Se acabó ${item.nombre}` : `Queda poco de ${item.nombre}`;
}

export function stockAlertMessage(item: Pick<ItemInventario, 'cantidad'>): string {
  return item.cantidad === 0
    ? 'Ya no quedan unidades en el inventario. Cuando puedas, consigue más para la próxima toma.'
    : `Quedan ${unitsLabel(item.cantidad)}. Te conviene reponerlo pronto para no quedarte sin.`;
}
