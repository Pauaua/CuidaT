import { z } from 'zod';

import { emptyToNull, nullToEmpty, optionalPhone, optionalText, requiredText } from '@/lib/validation';
import type { Informacion, InformacionInsert } from '@/types/database';

export const infoSchema = z.object({
  nombre: requiredText('El nombre', 120),
  tipo_servicio: requiredText('El tipo de servicio', 60),
  descripcion: optionalText(500),
  direccion: optionalText(200),
  telefono: optionalPhone,
  utilidad: optionalText(500),
});

export type InfoFormValues = z.infer<typeof infoSchema>;

export function infoToForm(info: Informacion | undefined): InfoFormValues {
  return {
    nombre: nullToEmpty(info?.nombre),
    tipo_servicio: info?.tipo_servicio ?? 'CESFAM',
    descripcion: nullToEmpty(info?.descripcion),
    direccion: nullToEmpty(info?.direccion),
    telefono: nullToEmpty(info?.telefono),
    utilidad: nullToEmpty(info?.utilidad),
  };
}

export function formToInfo(values: InfoFormValues): InformacionInsert {
  return {
    nombre: values.nombre,
    tipo_servicio: values.tipo_servicio,
    descripcion: emptyToNull(values.descripcion),
    direccion: emptyToNull(values.direccion),
    telefono: emptyToNull(values.telefono),
    utilidad: emptyToNull(values.utilidad),
  };
}
