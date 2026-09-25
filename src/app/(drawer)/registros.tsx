import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText, EmptyState, ErrorState, FAB, Header, Screen, SkeletonList } from '@/components/ui';
import { usePersonNames } from '@/features/care/hooks/usePersons';
import { RecordFilters } from '@/features/records/components/RecordFilters';
import { RecordTimelineItem } from '@/features/records/components/RecordTimelineItem';
import { useRecords } from '@/features/records/hooks/useRecords';
import type { RecordFilters as Filters } from '@/features/records/services/recordService';
import { addDays, capitalize, formatLongDate, toISODate } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { Registro } from '@/types/database';

function groupByDay(records: Registro[]): [string, Registro[]][] {
  const groups = new Map<string, Registro[]>();
  for (const r of records) {
    const key = toISODate(new Date(r.fecha_hora));
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.entries()];
}

export default function RecordsScreen() {
  const { spacing } = useTheme();
  const [filters, setFilters] = useState<Filters>(() => ({
    from: addDays(new Date(), -7),
    to: new Date(),
    tipo: null,
    personaId: null,
  }));
  const records = useRecords(filters);
  const { names } = usePersonNames();

  return (
    <Screen
      refreshing={records.isRefetching}
      onRefresh={() => records.refetch()}
      overlay={<FAB onPress={() => router.push('/form/registro')} accessibilityLabel="Agregar registro" />}>
      <Header title="Registros" subtitle="Todo lo que haces cuenta" />
      <RecordFilters filters={filters} onChange={setFilters} />

      {records.isLoading ? (
        <SkeletonList />
      ) : records.isError ? (
        <ErrorState message={records.error.message} onRetry={() => records.refetch()} />
      ) : !records.data || records.data.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="Sin registros en estas fechas"
          message="Cuando marques medicamentos o cambies el inventario, aparecerá aquí. También puedes anotar cosas a mano."
          actionLabel="Agregar registro"
          onAction={() => router.push('/form/registro')}
        />
      ) : (
        <View style={{ gap: spacing.lg, marginTop: spacing.sm }}>
          {groupByDay(records.data).map(([day, list]) => (
            <View key={day}>
              <AppText variant="label" color="textMuted" style={{ marginBottom: spacing.sm }} accessibilityRole="header">
                {capitalize(formatLongDate(new Date(list[0]?.fecha_hora ?? day)))}
              </AppText>
              {list.map((r, i) => (
                <RecordTimelineItem
                  key={r.id}
                  record={r}
                  personName={r.persona_cuidada_id ? names.get(r.persona_cuidada_id) : undefined}
                  isLast={i === list.length - 1}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
