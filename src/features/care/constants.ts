import type { SelectOption } from '@/components/ui';
import type { BadgeTone } from '@/components/ui/Badge';
import type { NivelDependencia } from '@/types/database';

export const nivelDependenciaLabels: Record<NivelDependencia, string> = {
  leve: 'Dependencia leve',
  moderada: 'Dependencia moderada',
  severa: 'Dependencia severa',
};

export const nivelDependenciaTones: Record<NivelDependencia, BadgeTone> = {
  leve: 'success',
  moderada: 'warning',
  severa: 'danger',
};

export const nivelDependenciaOptions: SelectOption<NivelDependencia>[] = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'severa', label: 'Severa' },
];
