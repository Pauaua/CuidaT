import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelAllMedicationReminders } from '@/features/medications/services/notificationService';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

import { deleteMyAccount, setAccountPaused } from '../services/profileService';

/** Pausa la cuenta: detiene los recordatorios; los datos quedan intactos. */
export function usePauseAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      await setAccountPaused(profileId, true);
      await cancelAllMedicationReminders();
    },
    // Al refrescar el perfil, el layout raíz muestra la pantalla de pausa
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

/** Reactiva la cuenta; los recordatorios se reprograman al volver al inicio. */
export function useResumeAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => setAccountPaused(profileId, false),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

/** Elimina para siempre la cuenta y todos sus datos, y cierra la sesión en este teléfono. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await deleteMyAccount();
      await cancelAllMedicationReminders();
      // La cuenta ya no existe en el servidor: solo limpiamos la sesión local
      await supabase.auth.signOut({ scope: 'local' });
    },
  });
}
