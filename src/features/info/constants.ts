import type { Ionicons } from '@expo/vector-icons';

import type { SelectOption } from '@/components/ui';

export const serviceTypeOptions: SelectOption<string>[] = [
  { value: 'CESFAM', label: 'CESFAM / Consultorio' },
  { value: 'Farmacia', label: 'Farmacia' },
  { value: 'Urgencia', label: 'Urgencia (SAPU, SAR, hospital)' },
  { value: 'Municipio', label: 'Municipio / Oficina de discapacidad' },
  { value: 'Kinesiólogo', label: 'Kinesiólogo' },
  { value: 'Médico', label: 'Médico tratante' },
  { value: 'Apoyo a cuidadores', label: 'Apoyo a personas cuidadoras' },
  { value: 'Otro', label: 'Otro' },
];

export function serviceIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'CESFAM':
    case 'Médico':
      return 'medical-outline';
    case 'Farmacia':
      return 'bandage-outline';
    case 'Urgencia':
      return 'pulse-outline';
    case 'Municipio':
      return 'business-outline';
    case 'Kinesiólogo':
      return 'accessibility-outline';
    case 'Apoyo a cuidadores':
      return 'people-outline';
    default:
      return 'information-circle-outline';
  }
}
