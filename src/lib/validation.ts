import { z } from 'zod';

/** Reglas zod reutilizables, con mensajes en español. */

export const requiredText = (field: string, max = 120) =>
  z
    .string({ error: `${field} es obligatorio` })
    .trim()
    .min(1, `${field} es obligatorio`)
    .max(max, `${field} puede tener hasta ${max} caracteres`);

export const optionalText = (max = 1000) =>
  z.string().trim().max(max, `Puede tener hasta ${max} caracteres`);

export const optionalAge = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d{1,3}$/.test(v) && Number(v) <= 130), 'Ingresa una edad válida');

export const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\+?[\d\s()-]{8,20}$/.test(v), 'Ingresa un teléfono válido (ej: +56 9 1234 5678)');

export const emailField = z
  .string({ error: 'El correo es obligatorio' })
  .trim()
  .min(1, 'El correo es obligatorio')
  .pipe(z.email('Ingresa un correo válido'));

export const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Ingresa una hora válida (HH:MM)');

export const nonNegativeIntText = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} es obligatorio`)
    .regex(/^\d{1,6}$/, `${field} debe ser un número entero, sin decimales`);

/** "" → null. */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** "" → null; "42" → 42. */
export function toIntOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number.parseInt(trimmed, 10);
}

/** null → "" (para precargar formularios). */
export function nullToEmpty(value: string | number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}
