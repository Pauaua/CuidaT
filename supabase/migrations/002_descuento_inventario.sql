-- =====================================================================
-- Migración 002 · Descuento automático de inventario al dar una toma
-- Ejecútala en el SQL Editor de Supabase (es idempotente).
-- También está incluida al final de supabase/schema.sql.
-- =====================================================================

-- Cada medicamento puede vincularse a un ítem del inventario y definir
-- cuántas unidades se usan en cada toma.
alter table public.medicamentos
  add column if not exists inventario_id uuid
    references public.inventario (id) on delete set null,
  add column if not exists unidades_por_toma integer not null default 1;

do $$ begin
  alter table public.medicamentos
    add constraint medicamentos_unidades_por_toma_positivas
    check (unidades_por_toma between 1 and 100);
exception when duplicate_object then null; end $$;

create index if not exists idx_medicamentos_inventario on public.medicamentos (inventario_id);

-- Solo se puede vincular un ítem del inventario propio
drop policy if exists medicamentos_inventario_propio on public.medicamentos;
create policy medicamentos_inventario_propio on public.medicamentos
  as restrictive for all to authenticated
  using (
    inventario_id is null
    or exists (
      select 1 from public.inventario i
      where i.id = inventario_id and i.usuario_id = public.current_usuario_id()
    )
  )
  with check (
    inventario_id is null
    or exists (
      select 1 from public.inventario i
      where i.id = inventario_id and i.usuario_id = public.current_usuario_id()
    )
  );

-- Al registrar una toma como dada, se descuentan sus unidades del inventario.
-- El cambio de cantidad genera además su propio registro "cambio_inventario"
-- (trigger trg_inventario_registro), así queda todo en el historial.
create or replace function public.descontar_toma_inventario()
returns trigger
language plpgsql
as $$
declare
  v_inventario uuid;
  v_unidades integer;
begin
  if new.tipo = 'medicamento_administrado' and new.medicamento_id is not null then
    select inventario_id, unidades_por_toma
      into v_inventario, v_unidades
      from public.medicamentos
     where id = new.medicamento_id;

    if v_inventario is not null then
      update public.inventario
         set cantidad = greatest(cantidad - v_unidades, 0)
       where id = v_inventario;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_registros_descontar_toma on public.registros;
create trigger trg_registros_descontar_toma
after insert on public.registros
for each row execute function public.descontar_toma_inventario();
