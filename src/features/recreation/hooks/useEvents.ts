import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { endOfWeek, overlapHours, startOfWeek } from '@/lib/dates';
import { queryKeys } from '@/lib/queryClient';
import type { EventoRecreacion, EventoRecreacionInsert } from '@/types/database';

import { isFreeTime } from '../constants';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEventsInRange,
  updateEvent,
} from '../services/eventService';

export function useEventsInRange(from: Date, to: Date) {
  return useQuery({
    queryKey: queryKeys.eventsRange(from.toISOString(), to.toISOString()),
    queryFn: () => listEventsInRange(from, to),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.event(id ?? ''),
    queryFn: () => getEvent(id as string),
    enabled: Boolean(id),
  });
}

export function useSaveEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: EventoRecreacionInsert }) =>
      id ? updateEvent(id, values) : createEvent(values),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.events }),
  });
}

export function useDeleteEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.events }),
  });
}

function useThisWeekEvents() {
  // Se calcula una vez por montaje: la semana no cambia mientras miras la pantalla.
  const [now, from, to] = useMemo(() => {
    const current = new Date();
    return [current, startOfWeek(current), endOfWeek(current)];
  }, []);
  return { ...useEventsInRange(from, to), now, from, to };
}

export type WeeklyBalance = {
  freeHours: number;
  careHours: number;
};

export function computeWeeklyBalance(events: EventoRecreacion[], from: Date, to: Date): WeeklyBalance {
  return events.reduce<WeeklyBalance>(
    (acc, e) => {
      const hours = overlapHours(new Date(e.fecha_inicio), new Date(e.fecha_fin), from, to);
      if (isFreeTime(e.tipo)) acc.freeHours += hours;
      else acc.careHours += hours;
      return acc;
    },
    { freeHours: 0, careHours: 0 }
  );
}

/** Horas libres vs. horas de cuidado de la semana actual (lunes a domingo). */
export function useWeeklyBalance() {
  const query = useThisWeekEvents();
  const balance = useMemo(
    () => computeWeeklyBalance(query.data ?? [], query.from, query.to),
    [query.data, query.from, query.to]
  );
  return { ...query, balance };
}

/** Próxima actividad libre de esta semana (o la que está ocurriendo ahora). */
export function useNextFreeActivity() {
  const query = useThisWeekEvents();
  const { data, now } = query;
  const next = useMemo(
    () =>
      (data ?? [])
        .filter((e) => isFreeTime(e.tipo) && new Date(e.fecha_fin) > now)
        .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))[0],
    [data, now]
  );
  return { ...query, next };
}
