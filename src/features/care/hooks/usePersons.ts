import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { cancelMedicationReminders } from '@/features/medications/services/notificationService';
import { queryKeys } from '@/lib/queryClient';
import type { PersonaCuidadaInsert } from '@/types/database';

import {
  createPerson,
  deletePerson,
  getPerson,
  listPersons,
  updatePerson,
} from '../services/personService';

export function usePersons() {
  return useQuery({ queryKey: queryKeys.persons, queryFn: listPersons });
}

export function usePerson(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.person(id ?? ''),
    queryFn: () => getPerson(id as string),
    enabled: Boolean(id),
  });
}

/** Mapa id → nombre, útil para mostrar a quién pertenece cada dato. */
export function usePersonNames() {
  const query = usePersons();
  const names = useMemo(
    () => new Map((query.data ?? []).map((p) => [p.id, p.nombre])),
    [query.data]
  );
  return { ...query, names };
}

export function useSavePerson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: PersonaCuidadaInsert }) =>
      id ? updatePerson(id, values) : createPerson(values),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.persons }),
  });
}

export function useDeletePerson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, medicationIds }: { id: string; medicationIds: string[] }) => {
      await deletePerson(id);
      await Promise.all(medicationIds.map(cancelMedicationReminders));
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.persons });
      client.invalidateQueries({ queryKey: queryKeys.medications });
      client.invalidateQueries({ queryKey: queryKeys.inventory });
      client.invalidateQueries({ queryKey: queryKeys.records });
    },
  });
}
