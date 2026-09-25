import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { ItemInventario, ItemInventarioInsert } from '@/types/database';

export async function listInventory(): Promise<ItemInventario[]> {
  return unwrap(await supabase.from('inventario').select('*').order('nombre'));
}

export async function getInventoryItem(id: string): Promise<ItemInventario> {
  return unwrap(await supabase.from('inventario').select('*').eq('id', id).single());
}

export async function createInventoryItem(values: ItemInventarioInsert): Promise<ItemInventario> {
  return unwrap(await supabase.from('inventario').insert(values).select().single());
}

export async function updateInventoryItem(
  id: string,
  values: ItemInventarioInsert
): Promise<ItemInventario> {
  return unwrap(await supabase.from('inventario').update(values).eq('id', id).select().single());
}

export async function deleteInventoryItem(id: string): Promise<void> {
  assertOk(await supabase.from('inventario').delete().eq('id', id));
}

/**
 * Suma o resta unidades de forma atómica (función SQL `ajustar_inventario`).
 * El registro en el historial lo crea un trigger en la base de datos.
 */
export async function adjustInventory(id: string, delta: number): Promise<ItemInventario> {
  return unwrap(await supabase.rpc('ajustar_inventario', { p_id: id, p_delta: delta }).single());
}
