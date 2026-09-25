import { z } from 'zod';

import { requiredText, timeField } from '@/lib/validation';
import type { RegistroInsert } from '@/types/database';

export const recordSchema = z
  .object({
    tipo: z.enum(['medicamento_administrado', 'tarea', 'cambio_inventario', 'nota', 'actividad'], {
      error: 'Elige un tipo de registro',
    }),
    descripcion: requiredText('La descripción', 1000),
    persona_cuidada_id: z.string().nullable(),
    fecha: z.date({ error: 'Elige una fecha' }),
    hora: timeField,
  })
  .refine((v) => combine(v.fecha, v.hora).getTime() <= Date.now() + 60_000, {
    message: 'El registro no puede quedar en el futuro',
    path: ['hora'],
  });

export type RecordFormValues = z.infer<typeof recordSchema>;

function combine(fecha: Date, hora: string): Date {
  const date = new Date(fecha);
  const [h = 0, m = 0] = hora.split(':').map(Number);
  date.setHours(h, m, 0, 0);
  return date;
}

export function formToRecord(values: RecordFormValues): RegistroInsert {
  return {
    tipo: values.tipo,
    descripcion: values.descripcion,
    persona_cuidada_id: values.persona_cuidada_id,
    fecha_hora: combine(values.fecha, values.hora).toISOString(),
  };
}
