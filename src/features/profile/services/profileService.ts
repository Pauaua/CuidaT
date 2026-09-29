import { supabase, toFriendlyError, unwrap } from '@/lib/supabase';
import type { Usuario, UsuarioInsert } from '@/types/database';

/** Perfil de la persona cuidadora autenticada, o null si aún no lo crea. */
export async function getProfile(): Promise<Usuario | null> {
  const { data, error } = await supabase.from('usuarios').select('*').maybeSingle();
  if (error) throw toFriendlyError(error);
  return data;
}

/** Crea o actualiza el perfil (auth_user_id lo completa la base de datos). */
export async function saveProfile(values: UsuarioInsert, existingId?: string): Promise<Usuario> {
  if (existingId) {
    return unwrap(
      await supabase.from('usuarios').update(values).eq('id', existingId).select().single()
    );
  }
  return unwrap(await supabase.from('usuarios').insert(values).select().single());
}

/** Pausa (fecha actual) o reactiva (null) la cuenta. Los datos no se tocan. */
export async function setAccountPaused(id: string, paused: boolean): Promise<Usuario> {
  return unwrap(
    await supabase
      .from('usuarios')
      .update({ pausada_en: paused ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single()
  );
}

/**
 * Elimina para siempre la cuenta y todos sus datos (función SQL
 * `eliminar_mi_cuenta`, que solo puede borrar la cuenta de quien la llama).
 */
export async function deleteMyAccount(): Promise<void> {
  const { error } = await supabase.rpc('eliminar_mi_cuenta');
  if (error) throw toFriendlyError(error);
}
