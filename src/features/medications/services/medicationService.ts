import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { Medicamento, MedicamentoInsert } from '@/types/database';

/** Todos los medicamentos de las personas cuidadas por el usuario (RLS filtra). */
export async function listMedications(): Promise<Medicamento[]> {
  return unwrap(await supabase.from('medicamentos').select('*').order('nombre'));
}

export async function getMedication(id: string): Promise<Medicamento> {
  return unwrap(await supabase.from('medicamentos').select('*').eq('id', id).single());
}

export async function createMedication(values: MedicamentoInsert): Promise<Medicamento> {
  return unwrap(await supabase.from('medicamentos').insert(values).select().single());
}

export async function updateMedication(id: string, values: MedicamentoInsert): Promise<Medicamento> {
  return unwrap(await supabase.from('medicamentos').update(values).eq('id', id).select().single());
}

export async function deleteMedication(id: string): Promise<void> {
  assertOk(await supabase.from('medicamentos').delete().eq('id', id));
}
