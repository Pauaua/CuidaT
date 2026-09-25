import { useMutation } from '@tanstack/react-query';

import { cancelAllMedicationReminders } from '@/features/medications/services/notificationService';

import { sendPasswordReset, signIn, signOut, signUp } from '../services/authService';

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}

export function usePasswordReset() {
  return useMutation({ mutationFn: sendPasswordReset });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      await cancelAllMedicationReminders();
      await signOut();
    },
  });
}
