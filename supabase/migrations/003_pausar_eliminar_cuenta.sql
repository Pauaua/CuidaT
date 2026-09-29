-- =====================================================================
-- Migración 003 · Pausar y eliminar cuenta
-- Ejecútala en el SQL Editor de Supabase (es idempotente).
-- También está incluida al final de supabase/schema.sql.
-- =====================================================================

-- Pausa: si tiene fecha, la cuenta está en pausa (datos intactos, sin recordatorios).
alter table public.usuarios
  add column if not exists pausada_en timestamptz;

-- Elimina la cuenta de quien la llama: borra su usuario de auth.users y, por las
-- llaves foráneas "on delete cascade", todos sus datos (perfil, personas cuidadas,
-- medicamentos, inventario, registros, servicios y agenda).
-- security definer: necesita permisos sobre auth.users, pero solo puede borrar
-- la cuenta del propio auth.uid(); nunca recibe un id por parámetro.
create or replace function public.eliminar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'No hay una sesión activa';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.eliminar_mi_cuenta() from public, anon;
grant execute on function public.eliminar_mi_cuenta() to authenticated;
