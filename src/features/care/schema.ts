import { z } from 'zod';

import { normalizeTime, timeToMinutes } from '@/lib/dates';
import {
  emptyToNull,
  nullToEmpty,
  optionalAge,
  optionalPhone,
  optionalText,
  requiredText,
  timeField,
  toIntOrNull,
} from '@/lib/validation';
import type { PersonaCuidada, PersonaCuidadaInsert } from '@/types/database';

const routineSchema = z.object({
  hora: timeField,
  descripcion: requiredText('La descripción de la rutina', 200),
});

export const personSchema = z.object({
  nombre: requiredText('El nombre', 80),
  edad: optionalAge,
  telefono: optionalPhone,
  direccion: optionalText(200),
  condicion_enfermedad: optionalText(),
  nivel_dependencia: z.enum(['leve', 'moderada', 'severa'], {
    error: 'Elige el nivel de dependencia',
  }),
  necesidades_fisicas: optionalText(),
  necesidades_mentales: optionalText(),
  rutinas: z.array(routineSchema).max(30, 'Puedes registrar hasta 30 rutinas'),
  comentarios_adicionales: optionalText(3000),
});

export type PersonFormValues = z.infer<typeof personSchema>;

export function personToForm(person: PersonaCuidada | undefined): PersonFormValues {
  return {
    nombre: nullToEmpty(person?.nombre),
    edad: nullToEmpty(person?.edad),
    telefono: nullToEmpty(person?.telefono),
    direccion: nullToEmpty(person?.direccion),
    condicion_enfermedad: nullToEmpty(person?.condicion_enfermedad),
    nivel_dependencia: person?.nivel_dependencia ?? 'leve',
    necesidades_fisicas: nullToEmpty(person?.necesidades_fisicas),
    necesidades_mentales: nullToEmpty(person?.necesidades_mentales),
    rutinas: (person?.rutinas ?? []).map((r) => ({ hora: normalizeTime(r.hora), descripcion: r.descripcion })),
    comentarios_adicionales: nullToEmpty(person?.comentarios_adicionales),
  };
}

export function formToPerson(values: PersonFormValues): PersonaCuidadaInsert {
  return {
    nombre: values.nombre,
    edad: toIntOrNull(values.edad),
    telefono: emptyToNull(values.telefono),
    direccion: emptyToNull(values.direccion),
    condicion_enfermedad: emptyToNull(values.condicion_enfermedad),
    nivel_dependencia: values.nivel_dependencia,
    necesidades_fisicas: emptyToNull(values.necesidades_fisicas),
    necesidades_mentales: emptyToNull(values.necesidades_mentales),
    rutinas: [...values.rutinas].sort((a, b) => timeToMinutes(a.hora) - timeToMinutes(b.hora)),
    comentarios_adicionales: emptyToNull(values.comentarios_adicionales),
  };
}
