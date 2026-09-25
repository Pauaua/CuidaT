import { useEffect } from 'react';

import { usePersonNames } from '@/features/care/hooks/usePersons';
import { useSettings } from '@/features/settings/hooks/SettingsProvider';

import {
  cancelAllMedicationReminders,
  syncAllMedicationReminders,
} from '../services/notificationService';
import { useMedications } from './useMedications';

/**
 * Mantiene los recordatorios locales sincronizados con los medicamentos
 * guardados (por ejemplo, al instalar la app en un teléfono nuevo).
 */
export function useReminderSync() {
  const { settings, loaded } = useSettings();
  const medications = useMedications();
  const persons = usePersonNames();

  const enabled = settings.medicationRemindersEnabled;
  const ready = loaded && medications.isSuccess && persons.isSuccess;

  useEffect(() => {
    if (!loaded) return;
    if (!enabled) {
      void cancelAllMedicationReminders();
      return;
    }
    if (ready && medications.data && persons.data) {
      void syncAllMedicationReminders(medications.data, persons.names).catch(() => {
        // Si falla (por ejemplo, sin permisos) la app sigue funcionando sin recordatorios.
      });
    }
    // Se reprograma solo cuando cambian los datos, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, enabled, ready, medications.dataUpdatedAt, persons.dataUpdatedAt]);
}
