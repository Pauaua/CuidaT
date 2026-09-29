-- =====================================================================
-- [NOMBRE_APP] · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecuta este script completo en el SQL Editor de Supabase.
-- Es idempotente en lo posible: puedes volver a correrlo en un proyecto nuevo.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type public.nivel_dependencia as enum ('leve', 'moderada', 'severa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tipo_inventario as enum ('medicamento', 'insumo', 'otro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tipo_registro as enum (
    'medicamento_administrado', 'tarea', 'cambio_inventario', 'nota', 'actividad'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tipo_evento as enum (
    'turno_cuidado', 'dia_libre', 'actividad_social', 'autocuidado'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Función genérica para updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. usuarios (persona cuidadora, vinculada a auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique default auth.uid()
    references auth.users (id) on delete cascade,
  nombre text not null,
  edad integer check (edad is null or (edad between 0 and 120)),
  condicion_fisica text,
  perfil_salud text,
  direccion text,
  correo text,
  telefono text,
  recreacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Devuelve el id de la fila en "usuarios" de quien está autenticado.
-- security definer para poder usarla dentro de políticas RLS sin recursión.
create or replace function public.current_usuario_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.usuarios where auth_user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------
-- 2. personas_cuidadas
-- ---------------------------------------------------------------------
create table if not exists public.personas_cuidadas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default public.current_usuario_id()
    references public.usuarios (id) on delete cascade,
  -- Preparado para la futura app de la persona cuidada: cuando tenga su
  -- propia cuenta, se vincula aquí. Por ahora queda en null.
  cuenta_auth_id uuid unique references auth.users (id) on delete set null,
  nombre text not null,
  edad integer check (edad is null or (edad between 0 and 130)),
  direccion text,
  telefono text,
  condicion_enfermedad text,
  nivel_dependencia public.nivel_dependencia not null default 'leve',
  necesidades_fisicas text,
  necesidades_mentales text,
  -- Lista de rutinas diarias: [{ "hora": "08:00", "descripcion": "Desayuno" }]
  rutinas jsonb not null default '[]'::jsonb,
  comentarios_adicionales text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.es_persona_propia(p_persona_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.personas_cuidadas
    where id = p_persona_id and usuario_id = public.current_usuario_id()
  )
$$;

-- ---------------------------------------------------------------------
-- 3. medicamentos
-- ---------------------------------------------------------------------
create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  persona_cuidada_id uuid not null
    references public.personas_cuidadas (id) on delete cascade,
  nombre text not null,
  laboratorio text,
  dosis text not null,
  horas_toma time[] not null default '{}',
  indicaciones_especiales text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. inventario
-- ---------------------------------------------------------------------
create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default public.current_usuario_id()
    references public.usuarios (id) on delete cascade,
  persona_cuidada_id uuid references public.personas_cuidadas (id) on delete set null,
  nombre text not null,
  tipo public.tipo_inventario not null default 'otro',
  descripcion text,
  cantidad integer not null default 0 check (cantidad >= 0),
  umbral_bajo integer not null default 5 check (umbral_bajo >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. registros (historial)
-- ---------------------------------------------------------------------
create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default public.current_usuario_id()
    references public.usuarios (id) on delete cascade,
  persona_cuidada_id uuid references public.personas_cuidadas (id) on delete set null,
  tipo public.tipo_registro not null,
  descripcion text not null,
  fecha_hora timestamptz not null default now(),
  -- Referencias opcionales para saber qué toma se marcó como dada
  medicamento_id uuid references public.medicamentos (id) on delete set null,
  hora_programada time,
  inventario_id uuid references public.inventario (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. informaciones (servicios útiles)
-- ---------------------------------------------------------------------
create table if not exists public.informaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default public.current_usuario_id()
    references public.usuarios (id) on delete cascade,
  nombre text not null,
  tipo_servicio text not null,
  descripcion text,
  direccion text,
  telefono text,
  utilidad text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. eventos_recreacion (agenda de la cuidadora)
-- ---------------------------------------------------------------------
create table if not exists public.eventos_recreacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default public.current_usuario_id()
    references public.usuarios (id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  tipo public.tipo_evento not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eventos_fechas_validas check (fecha_fin > fecha_inicio)
);

-- ---------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------
create index if not exists idx_personas_usuario on public.personas_cuidadas (usuario_id);
create index if not exists idx_medicamentos_persona on public.medicamentos (persona_cuidada_id);
create index if not exists idx_inventario_usuario on public.inventario (usuario_id);
create index if not exists idx_inventario_persona on public.inventario (persona_cuidada_id);
create index if not exists idx_inventario_tipo on public.inventario (usuario_id, tipo);
create index if not exists idx_registros_usuario_fecha on public.registros (usuario_id, fecha_hora desc);
create index if not exists idx_registros_persona on public.registros (persona_cuidada_id);
create index if not exists idx_registros_medicamento on public.registros (medicamento_id, fecha_hora);
create index if not exists idx_informaciones_usuario on public.informaciones (usuario_id);
create index if not exists idx_eventos_usuario_fecha on public.eventos_recreacion (usuario_id, fecha_inicio);

-- ---------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'usuarios', 'personas_cuidadas', 'medicamentos', 'inventario',
    'registros', 'informaciones', 'eventos_recreacion'
  ] loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Registro automático de cambios de inventario
-- ---------------------------------------------------------------------
create or replace function public.registrar_cambio_inventario()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.registros (usuario_id, persona_cuidada_id, tipo, descripcion, inventario_id)
    values (new.usuario_id, new.persona_cuidada_id, 'cambio_inventario',
            format('Agregaste "%s" al inventario (%s unidades)', new.nombre, new.cantidad), new.id);
  elsif tg_op = 'UPDATE' and new.cantidad is distinct from old.cantidad then
    insert into public.registros (usuario_id, persona_cuidada_id, tipo, descripcion, inventario_id)
    values (new.usuario_id, new.persona_cuidada_id, 'cambio_inventario',
            format('"%s": %s → %s unidades', new.nombre, old.cantidad, new.cantidad), new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_inventario_registro on public.inventario;
create trigger trg_inventario_registro
after insert or update of cantidad on public.inventario
for each row execute function public.registrar_cambio_inventario();

-- Ajuste atómico de cantidad (+/-). Respeta RLS (security invoker).
create or replace function public.ajustar_inventario(p_id uuid, p_delta integer)
returns public.inventario
language sql
security invoker
set search_path = public
as $$
  update public.inventario
  set cantidad = greatest(cantidad + p_delta, 0)
  where id = p_id
  returning *;
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.usuarios enable row level security;
alter table public.personas_cuidadas enable row level security;
alter table public.medicamentos enable row level security;
alter table public.inventario enable row level security;
alter table public.registros enable row level security;
alter table public.informaciones enable row level security;
alter table public.eventos_recreacion enable row level security;

-- usuarios: cada quien solo ve y edita su propio perfil
drop policy if exists usuarios_select on public.usuarios;
create policy usuarios_select on public.usuarios
  for select to authenticated using (auth_user_id = auth.uid());
drop policy if exists usuarios_insert on public.usuarios;
create policy usuarios_insert on public.usuarios
  for insert to authenticated with check (auth_user_id = auth.uid());
drop policy if exists usuarios_update on public.usuarios;
create policy usuarios_update on public.usuarios
  for update to authenticated
  using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
drop policy if exists usuarios_delete on public.usuarios;
create policy usuarios_delete on public.usuarios
  for delete to authenticated using (auth_user_id = auth.uid());

-- Tablas con usuario_id directo: mismas cuatro políticas
do $$
declare t text;
begin
  foreach t in array array[
    'personas_cuidadas', 'inventario', 'registros', 'informaciones', 'eventos_recreacion'
  ] loop
    execute format('drop policy if exists %1$s_select on public.%1$s', t);
    execute format('create policy %1$s_select on public.%1$s for select to authenticated
      using (usuario_id = public.current_usuario_id())', t);

    execute format('drop policy if exists %1$s_insert on public.%1$s', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated
      with check (usuario_id = public.current_usuario_id())', t);

    execute format('drop policy if exists %1$s_update on public.%1$s', t);
    execute format('create policy %1$s_update on public.%1$s for update to authenticated
      using (usuario_id = public.current_usuario_id())
      with check (usuario_id = public.current_usuario_id())', t);

    execute format('drop policy if exists %1$s_delete on public.%1$s', t);
    execute format('create policy %1$s_delete on public.%1$s for delete to authenticated
      using (usuario_id = public.current_usuario_id())', t);
  end loop;
end $$;

-- La persona cuidada referenciada (si existe) también debe ser propia
drop policy if exists inventario_persona_propia on public.inventario;
create policy inventario_persona_propia on public.inventario
  as restrictive for all to authenticated
  using (persona_cuidada_id is null or public.es_persona_propia(persona_cuidada_id))
  with check (persona_cuidada_id is null or public.es_persona_propia(persona_cuidada_id));

drop policy if exists registros_persona_propia on public.registros;
create policy registros_persona_propia on public.registros
  as restrictive for all to authenticated
  using (persona_cuidada_id is null or public.es_persona_propia(persona_cuidada_id))
  with check (persona_cuidada_id is null or public.es_persona_propia(persona_cuidada_id));

-- medicamentos: acceso a través de la persona cuidada
drop policy if exists medicamentos_select on public.medicamentos;
create policy medicamentos_select on public.medicamentos
  for select to authenticated using (public.es_persona_propia(persona_cuidada_id));
drop policy if exists medicamentos_insert on public.medicamentos;
create policy medicamentos_insert on public.medicamentos
  for insert to authenticated with check (public.es_persona_propia(persona_cuidada_id));
drop policy if exists medicamentos_update on public.medicamentos;
create policy medicamentos_update on public.medicamentos
  for update to authenticated
  using (public.es_persona_propia(persona_cuidada_id))
  with check (public.es_persona_propia(persona_cuidada_id));
drop policy if exists medicamentos_delete on public.medicamentos;
create policy medicamentos_delete on public.medicamentos
  for delete to authenticated using (public.es_persona_propia(persona_cuidada_id));

-- Permisos de ejecución de funciones
revoke all on function public.current_usuario_id() from public, anon;
revoke all on function public.es_persona_propia(uuid) from public, anon;
revoke all on function public.ajustar_inventario(uuid, integer) from public, anon;
grant execute on function public.current_usuario_id() to authenticated;
grant execute on function public.es_persona_propia(uuid) to authenticated;
grant execute on function public.ajustar_inventario(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------
-- Descuento automático de inventario al dar una toma (migración 002)
-- ---------------------------------------------------------------------

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

-- ---------------------------------------------------------------------
-- Pausar y eliminar cuenta (migración 003)
-- ---------------------------------------------------------------------

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

-- ---------------------------------------------------------------------
-- Gastos (migración 004)
-- ---------------------------------------------------------------------

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

-- ---------------------------------------------------------------------
-- Las compras suman al inventario (migración 005)
-- ---------------------------------------------------------------------

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
