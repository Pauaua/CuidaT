import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { usePersonNames } from '@/features/care/hooks/usePersons';
import { getInventoryItem } from '@/features/inventory/services/inventoryService';
import { createRecord, listGivenDoses } from '@/features/records/services/recordService';
import { normalizeTime, timeToMinutes, toISODate } from '@/lib/dates';
import { queryKeys } from '@/lib/queryClient';
import type { ItemInventario, Medicamento } from '@/types/database';

import { useMedications } from './useMedications';

export type Dose = {
  key: string;
  medication: Medicamento;
  personName: string;
  time: string;
  given: boolean;
  /** Pasó la hora y aún no se marca */
  pending: boolean;
};

export function useGivenDoses(day: Date) {
  return useQuery({
    queryKey: queryKeys.givenDoses(toISODate(day)),
    queryFn: () => listGivenDoses(day),
  });
}

/** Todas las tomas programadas para hoy, ordenadas por hora. */
export function useTodayDoses() {
  const today = new Date();
  const medications = useMedications();
  const persons = usePersonNames();
  const given = useGivenDoses(today);

  const doses = useMemo<Dose[]>(() => {
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const givenKeys = new Set(
      (given.data ?? [])
        .filter((r) => r.medicamento_id && r.hora_programada)
        .map((r) => `${r.medicamento_id}-${normalizeTime(r.hora_programada as string)}`)
    );

    return (medications.data ?? [])
      .flatMap((medication) =>
        medication.horas_toma.map((raw) => {
          const time = normalizeTime(raw);
          const key = `${medication.id}-${time}`;
          const isGiven = givenKeys.has(key);
          return {
            key,
            medication,
            personName: persons.names.get(medication.persona_cuidada_id) ?? '',
            time,
            given: isGiven,
            pending: !isGiven && timeToMinutes(time) < nowMinutes,
          };
        })
      )
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    // `today` cambia en cada render; la lista depende solo de los datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medications.data, persons.names, given.data]);

  return {
    doses,
    isLoading: medications.isLoading || persons.isLoading || given.isLoading,
    isError: medications.isError || persons.isError || given.isError,
    refetch: () => Promise.all([medications.refetch(), persons.refetch(), given.refetch()]),
  };
}

export function useMarkDoseGiven() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (dose: Dose): Promise<MarkDoseResult> => {
      // La base de datos descuenta las unidades del inventario (trigger)
      await createRecord({
        tipo: 'medicamento_administrado',
        persona_cuidada_id: dose.medication.persona_cuidada_id,
        medicamento_id: dose.medication.id,
        hora_programada: dose.time,
        descripcion: `Diste ${dose.medication.nombre} (${dose.medication.dosis}) a ${dose.personName}, toma de las ${dose.time}`,
      });
      const stock = dose.medication.inventario_id
        ? await getInventoryItem(dose.medication.inventario_id).catch(() => null)
        : null;
      return { stock };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: queryKeys.records });
      client.invalidateQueries({ queryKey: queryKeys.inventory });
    },
  });
}

export type MarkDoseResult = {
  /** Estado del inventario vinculado después de descontar la toma (si hay vínculo). */
  stock: ItemInventario | null;
};
