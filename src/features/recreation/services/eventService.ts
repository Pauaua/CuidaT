import { assertOk, supabase, unwrap } from '@/lib/supabase';
import type { EventoRecreacion, EventoRecreacionInsert } from '@/types/database';

/** Eventos que se cruzan con el rango [from, to]. */
export async function listEventsInRange(from: Date, to: Date): Promise<EventoRecreacion[]> {
  return unwrap(
    await supabase
      .from('eventos_recreacion')
      .select('*')
      .lte('fecha_inicio', to.toISOString())
      .gte('fecha_fin', from.toISOString())
      .order('fecha_inicio')
  );
}

export async function getEvent(id: string): Promise<EventoRecreacion> {
  return unwrap(await supabase.from('eventos_recreacion').select('*').eq('id', id).single());
}

export async function createEvent(values: EventoRecreacionInsert): Promise<EventoRecreacion> {
  return unwrap(await supabase.from('eventos_recreacion').insert(values).select().single());
}

export async function updateEvent(id: string, values: EventoRecreacionInsert): Promise<EventoRecreacion> {
  return unwrap(
    await supabase.from('eventos_recreacion').update(values).eq('id', id).select().single()
  );
}

export async function deleteEvent(id: string): Promise<void> {
  assertOk(await supabase.from('eventos_recreacion').delete().eq('id', id));
}
