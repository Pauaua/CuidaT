import type { Ionicons } from '@expo/vector-icons';

import type { SelectOption } from '@/components/ui';
import type { ColorTokens } from '@/theme';
import type { TipoEvento } from '@/types/database';

export const tipoEventoLabels: Record<TipoEvento, string> = {
  turno_cuidado: 'Turno de cuidado',
  dia_libre: 'Día libre',
  actividad_social: 'Actividad social',
  autocuidado: 'Autocuidado',
};

/** Colores del calendario: morado, celeste, rosa pastel y verde menta. */
export const tipoEventoColor: Record<TipoEvento, keyof ColorTokens> = {
  turno_cuidado: 'eventCare',
  dia_libre: 'eventFreeDay',
  actividad_social: 'eventSocial',
  autocuidado: 'eventSelfCare',
};

export const tipoEventoIcons: Record<TipoEvento, keyof typeof Ionicons.glyphMap> = {
  turno_cuidado: 'heart-outline',
  dia_libre: 'sunny-outline',
  actividad_social: 'people-outline',
  autocuidado: 'leaf-outline',
};

export const tipoEventoOptions: SelectOption<TipoEvento>[] = [
  { value: 'autocuidado', label: 'Autocuidado (algo solo para ti)' },
  { value: 'actividad_social', label: 'Actividad social' },
  { value: 'dia_libre', label: 'Día libre' },
  { value: 'turno_cuidado', label: 'Turno de cuidado' },
];

export function isFreeTime(tipo: TipoEvento): boolean {
  return tipo !== 'turno_cuidado';
}
