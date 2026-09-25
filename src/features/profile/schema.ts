import { z } from 'zod';

import type { Usuario, UsuarioInsert } from '@/types/database';
import {
  emailField,
  emptyToNull,
  nullToEmpty,
  optionalAge,
  optionalPhone,
  optionalText,
  requiredText,
  toIntOrNull,
} from '@/lib/validation';

export const profileSchema = z.object({
  nombre: requiredText('Tu nombre', 80),
  edad: optionalAge,
  telefono: optionalPhone,
  correo: emailField,
  direccion: optionalText(200),
  condicion_fisica: optionalText(),
  perfil_salud: optionalText(),
  recreacion: optionalText(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export function profileToForm(profile: Usuario | null, fallbackEmail: string): ProfileFormValues {
  return {
    nombre: nullToEmpty(profile?.nombre),
    edad: nullToEmpty(profile?.edad),
    telefono: nullToEmpty(profile?.telefono),
    correo: profile?.correo ?? fallbackEmail,
    direccion: nullToEmpty(profile?.direccion),
    condicion_fisica: nullToEmpty(profile?.condicion_fisica),
    perfil_salud: nullToEmpty(profile?.perfil_salud),
    recreacion: nullToEmpty(profile?.recreacion),
  };
}

export function formToProfile(values: ProfileFormValues): UsuarioInsert {
  return {
    nombre: values.nombre,
    edad: toIntOrNull(values.edad),
    telefono: emptyToNull(values.telefono),
    correo: emptyToNull(values.correo),
    direccion: emptyToNull(values.direccion),
    condicion_fisica: emptyToNull(values.condicion_fisica),
    perfil_salud: emptyToNull(values.perfil_salud),
    recreacion: emptyToNull(values.recreacion),
  };
}
