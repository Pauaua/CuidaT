-- =====================================================================
-- Migración 005 · Las compras (gastos) suman al inventario
-- Ejecútala en el SQL Editor de Supabase (es idempotente).
-- También está incluida al final de supabase/schema.sql.
-- =====================================================================

-- Ítem del inventario al que se sumaron las unidades de esta compra (opcional)
alter table public.gastos
  add column if not exists inventario_id uuid
    references public.inventario (id) on delete set null;

create index if not exists idx_gastos_inventario on public.gastos (inventario_id);

-- Solo se puede vincular un ítem del inventario propio
drop policy if exists gastos_inventario_propio on public.gastos;
create policy gastos_inventario_propio on public.gastos
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

-- Mantiene el inventario en línea con las compras:
--   crear compra      → suma sus unidades
--   editar compra     → quita las unidades anteriores y suma las nuevas
--   eliminar compra   → quita sus unidades (sin bajar de 0)
-- Cada cambio de cantidad queda en el historial por trg_inventario_registro.
create or replace function public.sincronizar_compra_inventario()
returns trigger
language plpgsql
as $$
begin
  -- Mismo ítem y cambió la cantidad: se aplica solo la diferencia (un registro)
  if tg_op = 'UPDATE' and old.inventario_id is not distinct from new.inventario_id then
    if new.inventario_id is not null and old.cantidad <> new.cantidad then
      update public.inventario
         set cantidad = greatest(cantidad + new.cantidad - old.cantidad, 0)
       where id = new.inventario_id;
    end if;
    return new;
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.inventario_id is not null then
    if tg_op = 'DELETE'
       or old.inventario_id is distinct from new.inventario_id
       or old.cantidad <> new.cantidad then
      update public.inventario
         set cantidad = greatest(cantidad - old.cantidad, 0)
       where id = old.inventario_id;
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.inventario_id is not null then
    if tg_op = 'INSERT'
       or old.inventario_id is distinct from new.inventario_id
       or old.cantidad <> new.cantidad then
      update public.inventario
         set cantidad = cantidad + new.cantidad
       where id = new.inventario_id;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_gastos_inventario on public.gastos;
create trigger trg_gastos_inventario
after insert or update of cantidad, inventario_id or delete on public.gastos
for each row execute function public.sincronizar_compra_inventario();

-- Registra una compra creando en el mismo paso su ítem del inventario
-- (todo o nada). security invoker: respeta las políticas RLS de quien llama.
create or replace function public.crear_gasto_con_item(
  p_categoria public.categoria_gasto,
  p_nombre text,
  p_precio integer,
  p_cantidad integer,
  p_lugar text,
  p_fecha date,
  p_persona_cuidada_id uuid,
  p_notas text,
  p_umbral_bajo integer
)
returns public.gastos
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item uuid;
  v_gasto public.gastos;
begin
  insert into public.inventario (nombre, tipo, cantidad, umbral_bajo, persona_cuidada_id)
  values (
    p_nombre,
    case when p_categoria = 'medicamento' then 'medicamento'::public.tipo_inventario
         else 'insumo'::public.tipo_inventario end,
    0,
    greatest(coalesce(p_umbral_bajo, 5), 0),
    p_persona_cuidada_id
  )
  returning id into v_item;

  -- El trigger trg_gastos_inventario suma p_cantidad al ítem recién creado
  insert into public.gastos (
    categoria, nombre, precio, cantidad, lugar, fecha,
    persona_cuidada_id, notas, inventario_id
  )
  values (
    p_categoria, p_nombre, p_precio, p_cantidad, p_lugar, coalesce(p_fecha, current_date),
    p_persona_cuidada_id, p_notas, v_item
  )
  returning * into v_gasto;

  return v_gasto;
end;
$$;

revoke all on function public.crear_gasto_con_item(
  public.categoria_gasto, text, integer, integer, text, date, uuid, text, integer
) from public, anon;
grant execute on function public.crear_gasto_con_item(
  public.categoria_gasto, text, integer, integer, text, date, uuid, text, integer
) to authenticated;
