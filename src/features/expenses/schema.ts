import { z } from 'zod';

import { fromISODate, toISODate } from '@/lib/dates';
import { emptyToNull, nullToEmpty, optionalText, requiredText } from '@/lib/validation';
import type { CategoriaGasto, Gasto, GastoInsert } from '@/types/database';

/** "12.990", "$12990" o "12 990" → 12990 */
export function parsePesos(text: string): number {
  return Number.parseInt(text.replace(/[^\d]/g, '') || '0', 10);
}

/** Qué hacer con las unidades compradas en el inventario. */
export const DESTINO_NINGUNO = 'ninguno';
export const DESTINO_NUEVO = 'nuevo';

export const expenseSchema = z
  .object({
    categoria: z.enum(['medicamento', 'otro']),
    nombre: requiredText('El nombre', 120),
    cantidad: z
      .string()
      .trim()
      .regex(/^\d{1,5}$/, 'Ingresa un número entero')
      .refine((v) => Number(v) >= 1, 'Debe ser al menos 1'),
    precio: z
      .string()
      .trim()
      .min(1, 'El precio es obligatorio')
      .refine((v) => /^\$?\s*[\d.\s]+$/.test(v), 'Escribe solo números (ej: 12.990)')
      .refine((v) => parsePesos(v) <= 100_000_000, 'El precio es demasiado alto'),
    lugar: optionalText(120),
    fecha: z.date({ error: 'Elige una fecha' }),
    persona_cuidada_id: z.string().nullable(),
    notas: optionalText(500),
    /** 'ninguno' | 'nuevo' | id de un ítem del inventario */
    destino: z.string().min(1),
    /** Umbral de aviso del ítem nuevo (solo si destino = 'nuevo') */
    umbral_bajo: z.string().trim(),
    /** Medicamento elegido desde las sugerencias, para vincularlo al ítem */
    medicamento_id: z.string().nullable(),
  })
  .refine(
    (v) => v.destino !== DESTINO_NUEVO || (/^\d{1,4}$/.test(v.umbral_bajo) && Number(v.umbral_bajo) >= 0),
    { message: 'Ingresa un número entero', path: ['umbral_bajo'] }
  );

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function expenseToForm(
  expense: Gasto | undefined,
  categoria: CategoriaGasto,
  defaultThreshold: number
): ExpenseFormValues {
  return {
    categoria: expense?.categoria ?? categoria,
    nombre: nullToEmpty(expense?.nombre),
    cantidad: String(expense?.cantidad ?? 1),
    precio: expense ? String(expense.precio) : '',
    lugar: nullToEmpty(expense?.lugar),
    fecha: expense ? fromISODate(expense.fecha) : new Date(),
    persona_cuidada_id: expense?.persona_cuidada_id ?? null,
    notas: nullToEmpty(expense?.notas),
    // Compra nueva: por defecto crea su ítem en Inventario
    destino: expense ? (expense.inventario_id ?? DESTINO_NINGUNO) : DESTINO_NUEVO,
    umbral_bajo: String(defaultThreshold),
    medicamento_id: null,
  };
}

export type ExpenseSubmission = {
  values: GastoInsert;
  /** true: crear el ítem del inventario junto con la compra */
  createItem: boolean;
  umbralBajo: number;
  medicamentoId: string | null;
};

export function formToExpense(form: ExpenseFormValues): ExpenseSubmission {
  const linkedItem =
    form.destino === DESTINO_NINGUNO || form.destino === DESTINO_NUEVO ? null : form.destino;
  return {
    values: {
      categoria: form.categoria,
      nombre: form.nombre,
      precio: parsePesos(form.precio),
      cantidad: Number.parseInt(form.cantidad, 10),
      lugar: emptyToNull(form.lugar),
      fecha: toISODate(form.fecha),
      persona_cuidada_id: form.persona_cuidada_id,
      notas: emptyToNull(form.notas),
      inventario_id: linkedItem,
    },
    createItem: form.destino === DESTINO_NUEVO,
    umbralBajo: Number.parseInt(form.umbral_bajo, 10) || 0,
    // Si no se suma al inventario, no hay nada que vincular
    medicamentoId: form.destino === DESTINO_NINGUNO ? null : form.medicamento_id,
  };
}
