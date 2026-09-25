import type { Ionicons } from '@expo/vector-icons';

import type { SelectOption } from '@/components/ui';
import type { TipoRegistro } from '@/types/database';

export const tipoRegistroLabels: Record<TipoRegistro, string> = {
  medicamento_administrado: 'Medicamento',
  tarea: 'Tarea',
  cambio_inventario: 'Inventario',
  nota: 'Nota',
  actividad: 'Actividad',
};

export const tipoRegistroIcons: Record<TipoRegistro, keyof typeof Ionicons.glyphMap> = {
  medicamento_administrado: 'medkit',
  tarea: 'checkbox',
  cambio_inventario: 'cube',
  nota: 'document-text',
  actividad: 'walk',
};

export const tipoRegistroOptions: SelectOption<TipoRegistro>[] = (
  Object.keys(tipoRegistroLabels) as TipoRegistro[]
).map((value) => ({ value, label: tipoRegistroLabels[value] }));

/** Tipos que se pueden crear a mano (los otros se generan solos). */
export const manualRecordOptions: SelectOption<TipoRegistro>[] = [
  { value: 'tarea', label: 'Tarea realizada' },
  { value: 'nota', label: 'Nota' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'medicamento_administrado', label: 'Medicamento dado (fuera de horario)' },
];
