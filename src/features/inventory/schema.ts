import { z } from 'zod';

import { emptyToNull, nonNegativeIntText, nullToEmpty, optionalText, requiredText } from '@/lib/validation';
import type { ItemInventario, ItemInventarioInsert } from '@/types/database';

export const inventorySchema = z.object({
  nombre: requiredText('El nombre', 120),
  tipo: z.enum(['medicamento', 'insumo', 'otro'], { error: 'Elige un tipo' }),
  descripcion: optionalText(500),
  cantidad: nonNegativeIntText('La cantidad'),
  umbral_bajo: nonNegativeIntText('El aviso de stock bajo'),
  persona_cuidada_id: z.string().nullable(),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;

export function itemToForm(item: ItemInventario | undefined, defaultThreshold: number): InventoryFormValues {
  return {
    nombre: nullToEmpty(item?.nombre),
    tipo: item?.tipo ?? 'insumo',
    descripcion: nullToEmpty(item?.descripcion),
    cantidad: nullToEmpty(item?.cantidad ?? 0),
    umbral_bajo: nullToEmpty(item?.umbral_bajo ?? defaultThreshold),
    persona_cuidada_id: item?.persona_cuidada_id ?? null,
  };
}

export function formToItem(values: InventoryFormValues): ItemInventarioInsert {
  return {
    nombre: values.nombre,
    tipo: values.tipo,
    descripcion: emptyToNull(values.descripcion),
    cantidad: Number.parseInt(values.cantidad, 10),
    umbral_bajo: Number.parseInt(values.umbral_bajo, 10),
    persona_cuidada_id: values.persona_cuidada_id,
  };
}
