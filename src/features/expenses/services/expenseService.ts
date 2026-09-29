import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { Gasto, GastoInsert } from '@/types/database';

export async function listExpenses(): Promise<Gasto[]> {
  return unwrap(
    await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
  );
}

export async function getExpense(id: string): Promise<Gasto> {
  return unwrap(await supabase.from('gastos').select('*').eq('id', id).single());
}

export async function createExpense(values: GastoInsert): Promise<Gasto> {
  return unwrap(await supabase.from('gastos').insert(values).select().single());
}

export async function updateExpense(id: string, values: GastoInsert): Promise<Gasto> {
  return unwrap(await supabase.from('gastos').update(values).eq('id', id).select().single());
}

export async function deleteExpense(id: string): Promise<void> {
  assertOk(await supabase.from('gastos').delete().eq('id', id));
}

/**
 * Registra la compra y crea en el mismo paso su ítem en Inventario con las
 * unidades compradas (función SQL `crear_gasto_con_item`: todo o nada).
 */
export async function createExpenseWithNewItem(
  values: GastoInsert,
  umbralBajo: number
): Promise<Gasto> {
  return unwrap(
    await supabase
      .rpc('crear_gasto_con_item', {
        p_categoria: values.categoria,
        p_nombre: values.nombre,
        p_precio: values.precio,
        p_cantidad: values.cantidad,
        p_lugar: values.lugar,
        p_fecha: values.fecha,
        p_persona_cuidada_id: values.persona_cuidada_id,
        p_notas: values.notas,
        p_umbral_bajo: umbralBajo,
      })
      .single()
  );
}
