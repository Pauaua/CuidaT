import { ScrollView, View } from 'react-native';

import { Chip, DatePicker, Select } from '@/components/ui';
import { usePersons } from '@/features/care/hooks/usePersons';
import { useTheme } from '@/theme';
import type { TipoRegistro } from '@/types/database';

import { tipoRegistroOptions } from '../constants';
import type { RecordFilters as Filters } from '../services/recordService';

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function RecordFilters({ filters, onChange }: Props) {
  const { spacing } = useTheme();
  const persons = usePersons();

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.md }}>
        <Chip label="Todos" selected={filters.tipo === null} onPress={() => onChange({ ...filters, tipo: null })} />
        {tipoRegistroOptions.map((o) => (
          <Chip
            key={o.value}
            label={o.label}
            selected={filters.tipo === o.value}
            onPress={() => onChange({ ...filters, tipo: o.value as TipoRegistro })}
          />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <View style={{ flexGrow: 1, flexBasis: 140 }}>
          <DatePicker
            label="Desde"
            value={filters.from}
            maximumDate={filters.to}
            onChange={(from) => onChange({ ...filters, from })}
          />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 140 }}>
          <DatePicker
            label="Hasta"
            value={filters.to}
            minimumDate={filters.from}
            onChange={(to) => onChange({ ...filters, to })}
          />
        </View>
      </View>

      {persons.data && persons.data.length > 0 ? (
        <Select
          label="Persona"
          value={filters.personaId}
          options={persons.data.map((p) => ({ value: p.id, label: p.nombre }))}
          onChange={(personaId) => onChange({ ...filters, personaId })}
          allowEmpty
          emptyLabel="Todas las personas"
          placeholder="Todas las personas"
        />
      ) : null}
    </View>
  );
}
