-- =====================================================================
-- Migración 004 · Módulo de gastos
-- Ejecútala en el SQL Editor de Supabase (es idempotente).
-- También está incluida al final de supabase/schema.sql.
-- =====================================================================

do $$ begin
  create type public.categoria_gasto as enum ('medicamento', 'otro');
exception when duplicate_object then null; end $$;

create table if not exists public.gastos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default public.current_usuario_id()
    references public.usuarios (id) on delete cascade,
  persona_cuidada_id uuid references public.personas_cuidadas (id) on delete set null,
  categoria public.categoria_gasto not null,
  -- Qué se compró (ej: "Losartán 50 mg", "Pañales talla M")
  nombre text not null,
  -- Total pagado, en pesos chilenos (sin decimales)
  precio integer not null check (precio between 0 and 100000000),
  -- Unidades compradas; sirve para comparar el precio por unidad entre lugares
  cantidad integer not null default 1 check (cantidad between 1 and 10000),
  -- Farmacia o tienda donde se compró
  lugar text,
  fecha date not null default current_date,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gastos_usuario_fecha on public.gastos (usuario_id, fecha desc);
create index if not exists idx_gastos_usuario_categoria on public.gastos (usuario_id, categoria);

drop trigger if exists trg_gastos_updated_at on public.gastos;
create trigger trg_gastos_updated_at before update on public.gastos
for each row execute function public.set_updated_at();

alter table public.gastos enable row level security;

drop policy if exists gastos_select on public.gastos;
create policy gastos_select on public.gastos for select to authenticated
  using (usuario_id = public.current_usuario_id());
drop policy if exists gastos_insert on public.gastos;
create policy gastos_insert on public.gastos for insert to authenticated
  with check (usuario_id = public.current_usuario_id());
drop policy if exists gastos_update on public.gastos;
create policy gastos_update on public.gastos for update to authenticated
  using (usuario_id = public.current_usuario_id())
  with check (usuario_id = public.current_usuario_id());
drop policy if exists gastos_delete on public.gastos;
create policy gastos_delete on public.gastos for delete to authenticated
  using (usuario_id = public.current_usuario_id());

-- La persona cuidada referenciada (si existe) también debe ser propia
drop policy if exists gastos_persona_propia on public.gastos;
create policy gastos_persona_propia on public.gastos
  as restrictive for all to authenticated
  using (persona_cuidada_id is null or public.es_persona_propia(persona_cuidada_id))
  with check (persona_cuidada_id is null or public.es_persona_propia(persona_cuidada_id));
