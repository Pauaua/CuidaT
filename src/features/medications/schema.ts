import { z } from 'zod';

import { normalizeTime, timeToMinutes } from '@/lib/dates';
import { emptyToNull, nullToEmpty, optionalText, requiredText, timeField } from '@/lib/validation';
import type { Medicamento, MedicamentoInsert } from '@/types/database';

export const medicationSchema = z.object({
  nombre: requiredText('El nombre del medicamento', 120),
  laboratorio: optionalText(120),
  dosis: requiredText('La dosis', 120),
  horas_toma: z
    .array(z.object({ hora: timeField }))
    .min(1, 'Agrega al menos una hora de toma')
    .max(12, 'Puedes agregar hasta 12 horas al día')
    .refine(
      (list) => new Set(list.map((h) => h.hora)).size === list.length,
      'Hay horas repetidas'
    ),
  indicaciones_especiales: optionalText(1000),
  inventario_id: z.string().nullable(),
  unidades_por_toma: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, 'Ingresa un número entero')
    .refine((v) => Number(v) >= 1 && Number(v) <= 100, 'Debe ser entre 1 y 100'),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;

export function medicationToForm(medication: Medicamento | undefined): MedicationFormValues {
  return {
    nombre: nullToEmpty(medication?.nombre),
    laboratorio: nullToEmpty(medication?.laboratorio),
    dosis: nullToEmpty(medication?.dosis),
    horas_toma: (medication?.horas_toma ?? ['08:00']).map((h) => ({ hora: normalizeTime(h) })),
    indicaciones_especiales: nullToEmpty(medication?.indicaciones_especiales),
    inventario_id: medication?.inventario_id ?? null,
    unidades_por_toma: String(medication?.unidades_por_toma ?? 1),
  };
}

export function formToMedication(
  values: MedicationFormValues,
  personaCuidadaId: string
): MedicamentoInsert {
  return {
    persona_cuidada_id: personaCuidadaId,
    nombre: values.nombre,
    laboratorio: emptyToNull(values.laboratorio),
    dosis: values.dosis,
    horas_toma: values.horas_toma
      .map((h) => h.hora)
      .sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
    indicaciones_especiales: emptyToNull(values.indicaciones_especiales),
    inventario_id: values.inventario_id,
    unidades_por_toma: Number.parseInt(values.unidades_por_toma, 10),
  };
}
