import { z } from 'zod';

import { dateToTime } from '@/lib/dates';
import { emptyToNull, nullToEmpty, optionalText, requiredText, timeField } from '@/lib/validation';
import type { EventoRecreacion, EventoRecreacionInsert } from '@/types/database';

export const eventSchema = z
  .object({
    titulo: requiredText('El título', 120),
    descripcion: optionalText(500),
    tipo: z.enum(['turno_cuidado', 'dia_libre', 'actividad_social', 'autocuidado'], {
      error: 'Elige un tipo',
    }),
    fechaInicio: z.date({ error: 'Elige la fecha de inicio' }),
    horaInicio: timeField,
    fechaFin: z.date({ error: 'Elige la fecha de término' }),
    horaFin: timeField,
  })
  .refine((v) => combine(v.fechaFin, v.horaFin) > combine(v.fechaInicio, v.horaInicio), {
    message: 'El término debe ser después del inicio',
    path: ['horaFin'],
  });

export type EventFormValues = z.infer<typeof eventSchema>;

function combine(date: Date, time: string): Date {
  const d = new Date(date);
  const [h = 0, m = 0] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export function eventToForm(event: EventoRecreacion | undefined, day: Date): EventFormValues {
  if (event) {
    const start = new Date(event.fecha_inicio);
    const end = new Date(event.fecha_fin);
    return {
      titulo: event.titulo,
      descripcion: nullToEmpty(event.descripcion),
      tipo: event.tipo,
      fechaInicio: start,
      horaInicio: dateToTime(start),
      fechaFin: end,
      horaFin: dateToTime(end),
    };
  }
  return {
    titulo: '',
    descripcion: '',
    tipo: 'autocuidado',
    fechaInicio: day,
    horaInicio: '10:00',
    fechaFin: day,
    horaFin: '12:00',
  };
}

export function formToEvent(values: EventFormValues): EventoRecreacionInsert {
  return {
    titulo: values.titulo,
    descripcion: emptyToNull(values.descripcion),
    tipo: values.tipo,
    fecha_inicio: combine(values.fechaInicio, values.horaInicio).toISOString(),
    fecha_fin: combine(values.fechaFin, values.horaFin).toISOString(),
  };
}
