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
