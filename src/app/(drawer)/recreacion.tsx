import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, EmptyState, ErrorState, Header, Screen, SkeletonList } from '@/components/ui';
import { EventItem } from '@/features/recreation/components/EventItem';
import { RecreationCalendar } from '@/features/recreation/components/RecreationCalendar';
import { WeeklyBalanceCard } from '@/features/recreation/components/WeeklyBalanceCard';
import { tipoEventoColor, tipoEventoLabels } from '@/features/recreation/constants';
import { useEventsInRange } from '@/features/recreation/hooks/useEvents';
import {
  addDays,
  capitalize,
  endOfDay,
  endOfMonth,
  formatLongDate,
  fromISODate,
  startOfDay,
  startOfMonth,
  toISODate,
} from '@/lib/dates';
import { useTheme } from '@/theme';
import type { TipoEvento } from '@/types/database';

export default function RecreationScreen() {
  const { spacing } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  // Incluye una semana antes y después para los días visibles de meses vecinos
  const [from, to] = useMemo(() => [addDays(month, -7), addDays(endOfMonth(month), 7)], [month]);
  const events = useEventsInRange(from, to);

  const selected = fromISODate(selectedDate);
  const dayEvents = (events.data ?? []).filter(
    (e) => new Date(e.fecha_inicio) <= endOfDay(selected) && new Date(e.fecha_fin) >= startOfDay(selected)
  );

  const openForm = (id?: string) =>
    router.push({ pathname: '/form/evento', params: id ? { id } : { fecha: selectedDate } });

  return (
    <Screen refreshing={events.isRefetching} onRefresh={() => events.refetch()}>
      <Header title="Recreación" subtitle="Tu tiempo también importa" />

      <View style={{ gap: spacing.lg }}>
        <WeeklyBalanceCard />

        <View style={{ gap: spacing.sm }}>
          <RecreationCalendar
            events={events.data ?? []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={setMonth}
          />
          <Legend />
        </View>

        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
            <AppText variant="subtitle" accessibilityRole="header" style={{ flexShrink: 1 }}>
              {capitalize(formatLongDate(selected))}
            </AppText>
            <Button title="Agregar" icon="add" compact onPress={() => openForm()} />
          </View>

          {events.isLoading ? (
            <SkeletonList count={2} />
          ) : events.isError ? (
            <ErrorState message={events.error.message} onRetry={() => events.refetch()} />
          ) : dayEvents.length === 0 ? (
            <EmptyState
              icon="sunny-outline"
              title="Día sin planes"
              message="¿Qué tal un ratito para ti? Un café, una llamada a una amiga o simplemente descansar."
              actionLabel="Agendar algo"
              onAction={() => openForm()}
            />
          ) : (
            dayEvents.map((e) => <EventItem key={e.id} event={e} onPress={() => openForm(e.id)} />)
          )}
        </View>
      </View>
    </Screen>
  );
}

function Legend() {
  const { colors, spacing } = useTheme();
  const types = Object.keys(tipoEventoLabels) as TipoEvento[];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {types.map((t) => (
        <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors[tipoEventoColor[t]] }} />
          <AppText variant="caption">{tipoEventoLabels[t]}</AppText>
        </View>
      ))}
    </View>
  );
}
