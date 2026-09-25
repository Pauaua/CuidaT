import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import type { InformacionInsert } from '@/types/database';

import { createInfo, deleteInfo, getInfo, listInfos, updateInfo } from '../services/infoService';

export function useInfos() {
  return useQuery({ queryKey: queryKeys.infos, queryFn: listInfos });
}

export function useInfo(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.info(id ?? ''),
    queryFn: () => getInfo(id as string),
    enabled: Boolean(id),
  });
}

export function useSaveInfo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: InformacionInsert }) =>
      id ? updateInfo(id, values) : createInfo(values),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.infos }),
  });
}

export function useDeleteInfo() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteInfo,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.infos }),
  });
}
