import { supabase, toFriendlyError } from '@/lib/supabase';

export type Credentials = {
  email: string;
  password: string;
};

export async function signIn({ email, password }: Credentials): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toFriendlyError(error);
}

/**
 * Crea la cuenta. Devuelve `needsConfirmation: true` si el proyecto de
 * Supabase exige confirmar el correo antes de iniciar sesión.
 */
export async function signUp({ email, password }: Credentials): Promise<{ needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw toFriendlyError(error);
  return { needsConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toFriendlyError(error);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw toFriendlyError(error);
}
