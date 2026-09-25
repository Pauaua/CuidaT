import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { PersonaCuidada, PersonaCuidadaInsert } from '@/types/database';

export async function listPersons(): Promise<PersonaCuidada[]> {
  return unwrap(await supabase.from('personas_cuidadas').select('*').order('nombre'));
}

export async function getPerson(id: string): Promise<PersonaCuidada> {
  return unwrap(await supabase.from('personas_cuidadas').select('*').eq('id', id).single());
}

export async function createPerson(values: PersonaCuidadaInsert): Promise<PersonaCuidada> {
  return unwrap(await supabase.from('personas_cuidadas').insert(values).select().single());
}

export async function updatePerson(id: string, values: PersonaCuidadaInsert): Promise<PersonaCuidada> {
  return unwrap(
    await supabase.from('personas_cuidadas').update(values).eq('id', id).select().single()
  );
}

export async function deletePerson(id: string): Promise<void> {
  assertOk(await supabase.from('personas_cuidadas').delete().eq('id', id));
}
