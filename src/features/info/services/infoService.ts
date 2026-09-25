import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { Informacion, InformacionInsert } from '@/types/database';

export async function listInfos(): Promise<Informacion[]> {
  return unwrap(await supabase.from('informaciones').select('*').order('tipo_servicio').order('nombre'));
}

export async function getInfo(id: string): Promise<Informacion> {
  return unwrap(await supabase.from('informaciones').select('*').eq('id', id).single());
}

export async function createInfo(values: InformacionInsert): Promise<Informacion> {
  return unwrap(await supabase.from('informaciones').insert(values).select().single());
}

export async function updateInfo(id: string, values: InformacionInsert): Promise<Informacion> {
  return unwrap(await supabase.from('informaciones').update(values).eq('id', id).select().single());
}

export async function deleteInfo(id: string): Promise<void> {
  assertOk(await supabase.from('informaciones').delete().eq('id', id));
}
