import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import type { ItemInventario, ItemInventarioInsert } from '@/types/database';

import { isLowStock } from '../constants';
import {
  adjustInventory,
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItem,
  listInventory,
  updateInventoryItem,
} from '../services/inventoryService';

export function useInventory() {
  return useQuery({ queryKey: queryKeys.inventory, queryFn: listInventory });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: listInventory,
    select: (items: ItemInventario[]) => items.filter(isLowStock),
  });
}

export function useInventoryItem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inventoryItem(id ?? ''),
    queryFn: () => getInventoryItem(id as string),
    enabled: Boolean(id),
  });
}

function invalidateAll(client: ReturnType<typeof useQueryClient>) {
  client.invalidateQueries({ queryKey: queryKeys.inventory });
  // Los cambios de cantidad generan registros automáticos
  client.invalidateQueries({ queryKey: queryKeys.records });
}

export function useSaveInventoryItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id?: string; values: ItemInventarioInsert }) =>
      id ? updateInventoryItem(id, values) : createInventoryItem(values),
    onSuccess: () => invalidateAll(client),
  });
}

export function useDeleteInventoryItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => invalidateAll(client),
  });
}

/** +/− con actualización optimista para que se sienta inmediato. */
export function useAdjustInventory() {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ADJUST_KEY,
    mutationFn: ({ id, delta }: { id: string; delta: number }) => adjustInventory(id, delta),
    onMutate: async ({ id, delta }) => {
      await client.cancelQueries({ queryKey: queryKeys.inventory });
      const previous = client.getQueryData<ItemInventario[]>(queryKeys.inventory);
      client.setQueryData<ItemInventario[]>(queryKeys.inventory, (items) =>
        items?.map((item) =>
          item.id === id ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item
        )
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(queryKeys.inventory, context.previous);
    },
    onSettled: () => {
      // Con toques rápidos, refrescamos solo al terminar el último ajuste
      if (client.isMutating({ mutationKey: ADJUST_KEY }) === 1) invalidateAll(client);
    },
  });
}

const ADJUST_KEY = ['inventory', 'adjust'];
