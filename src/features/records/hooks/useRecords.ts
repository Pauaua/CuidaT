import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toISODate } from '@/lib/dates';
import { queryKeys } from '@/lib/queryClient';
import type { RegistroInsert } from '@/types/database';

import { createRecord, deleteRecord, listRecords, type RecordFilters } from '../services/recordService';

export function useRecords(filters: RecordFilters) {
  const keyFilters = {
    from: toISODate(filters.from),
    to: toISODate(filters.to),
    tipo: filters.tipo,
    personaId: filters.personaId,
  };
  return useQuery({
    queryKey: queryKeys.recordsFiltered(keyFilters),
    queryFn: () => listRecords(filters),
  });
}

export function useCreateRecord() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (values: RegistroInsert) => createRecord(values),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.records }),
  });
}

export function useDeleteRecord() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.records }),
  });
}
