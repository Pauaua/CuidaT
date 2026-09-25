import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/AuthProvider';
import { queryKeys } from '@/lib/queryClient';
import type { UsuarioInsert } from '@/types/database';

import { getProfile, saveProfile } from '../services/profileService';

export function useProfile() {
  const { session } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.profile, session?.user.id],
    queryFn: getProfile,
    enabled: Boolean(session),
  });
}

export function useSaveProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ values, id }: { values: UsuarioInsert; id?: string }) => saveProfile(values, id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}
