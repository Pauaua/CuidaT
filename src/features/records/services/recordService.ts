import { endOfDay, startOfDay } from '@/lib/dates';
import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { Registro, RegistroInsert, TipoRegistro } from '@/types/database';

export type RecordFilters = {
  /** YYYY-MM-DD inclusive */
  from: Date;
  to: Date;
  tipo: TipoRegistro | null;
  personaId: string | null;
};

export async function listRecords(filters: RecordFilters): Promise<Registro[]> {
  let query = supabase
    .from('registros')
    .select('*')
    .gte('fecha_hora', startOfDay(filters.from).toISOString())
    .lte('fecha_hora', endOfDay(filters.to).toISOString())
    .order('fecha_hora', { ascending: false })
    .limit(300);

  if (filters.tipo) query = query.eq('tipo', filters.tipo);
  if (filters.personaId) query = query.eq('persona_cuidada_id', filters.personaId);

  return unwrap(await query);
}

/** Tomas de medicamentos marcadas como dadas en un día. */
export async function listGivenDoses(day: Date): Promise<Registro[]> {
  return unwrap(
    await supabase
      .from('registros')
      .select('*')
      .eq('tipo', 'medicamento_administrado')
      .gte('fecha_hora', startOfDay(day).toISOString())
      .lte('fecha_hora', endOfDay(day).toISOString())
  );
}

export async function createRecord(values: RegistroInsert): Promise<Registro> {
  return unwrap(await supabase.from('registros').insert(values).select().single());
}

export async function deleteRecord(id: string): Promise<void> {
  assertOk(await supabase.from('registros').delete().eq('id', id));
}
