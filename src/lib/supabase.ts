import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. Revisa tu archivo .env (ver README).'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresca el token solo mientras la app está en primer plano.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

/**
 * Convierte errores de Supabase en mensajes amables.
 * Nunca registra el contenido en consola: puede contener datos de salud.
 */
export function toFriendlyError(error: unknown): Error {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : '';

  if (/network|fetch/i.test(message)) {
    return new Error('No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.');
  }
  if (/invalid login credentials/i.test(message)) {
    return new Error('El correo o la contraseña no coinciden.');
  }
  if (/already registered|already exists/i.test(message)) {
    return new Error('Ya existe una cuenta con ese correo.');
  }
  if (/email not confirmed/i.test(message)) {
    return new Error('Confirma tu correo antes de ingresar. Revisa tu bandeja de entrada.');
  }
  if (/password/i.test(message)) {
    return new Error('La contraseña no cumple los requisitos (mínimo 6 caracteres).');
  }
  return new Error('Algo no salió como esperábamos. Inténtalo de nuevo en un momento.');
}

/** Devuelve `data` o lanza un error amable si la respuesta de Supabase falló. */
export function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) {
    throw toFriendlyError(result.error);
  }
  if (result.data === null) {
    throw new Error('No encontramos la información solicitada.');
  }
  return result.data;
}

/** Igual que `unwrap`, pero solo valida el error (para deletes). */
export function assertOk(result: { error: unknown }): void {
  if (result.error) {
    throw toFriendlyError(result.error);
  }
}
