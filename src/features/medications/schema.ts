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
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;

export function medicationToForm(medication: Medicamento | undefined): MedicationFormValues {
  return {
    nombre: nullToEmpty(medication?.nombre),
    laboratorio: nullToEmpty(medication?.laboratorio),
    dosis: nullToEmpty(medication?.dosis),
    horas_toma: (medication?.horas_toma ?? ['08:00']).map((h) => ({ hora: normalizeTime(h) })),
    indicaciones_especiales: nullToEmpty(medication?.indicaciones_especiales),
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
  };
}
