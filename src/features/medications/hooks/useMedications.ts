import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSettings } from '@/features/settings/hooks/SettingsProvider';
import { queryKeys } from '@/lib/queryClient';
import type { Medicamento, MedicamentoInsert } from '@/types/database';

import {
  createMedication,
  deleteMedication,
  getMedication,
  listMedications,
  updateMedication,
} from '../services/medicationService';
import {
  cancelMedicationReminders,
  scheduleMedicationReminders,
} from '../services/notificationService';

export function useMedications() {
  return useQuery({ queryKey: queryKeys.medications, queryFn: listMedications });
}

/** Medicamentos de una persona (reutiliza la misma consulta en caché). */
export function useMedicationsByPerson(personId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.medications,
    queryFn: listMedications,
    select: (list: Medicamento[]) => list.filter((m) => m.persona_cuidada_id === personId),
    enabled: Boolean(personId),
  });
}

export function useMedication(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.medication(id ?? ''),
    queryFn: () => getMedication(id as string),
    enabled: Boolean(id),
  });
}

type SaveVars = {
  id?: string;
  values: MedicamentoInsert;
  personName: string;
};

export function useSaveMedication() {
  const client = useQueryClient();
  const { settings } = useSettings();

  return useMutation({
    mutationFn: async ({ id, values, personName }: SaveVars) => {
      const saved = id ? await updateMedication(id, values) : await createMedication(values);
      if (settings.medicationRemindersEnabled) {
        await scheduleMedicationReminders(saved, personName);
      }
      return saved;
    },
    onSuccess: (saved) => {
      client.invalidateQueries({ queryKey: queryKeys.medications });
      client.setQueryData(queryKeys.medication(saved.id), saved);
    },
  });
}

export function useDeleteMedication() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteMedication(id);
      await cancelMedicationReminders(id);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.medications }),
  });
}
