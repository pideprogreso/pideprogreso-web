-- PideProgreso: esquema inicial del MVP
-- Perfiles con rol, categorías, negocios, productos, pedidos, detalle e historial de estados.
-- Toda tabla tiene RLS. Los pedidos se crean y cambian solo mediante funciones.

-- ============================================================
-- Tipos
-- ============================================================

create type public.rol_usuario as enum ('cliente', 'negocio', 'admin');

create type public.estado_negocio as enum ('pendiente', 'aprobado', 'suspendido');

create type public.estado_pedido as enum (
  'recibido',        -- el cliente lo envió
  'aceptado',        -- el negocio lo aceptó
  'en_preparacion',
  'listo',           -- listo para recoger o para salir
  'en_camino',
  'entregado',
  'cancelado',       -- lo canceló el cliente
  'rechazado'        -- lo rechazó el negocio
);

create type public.modalidad_entrega as enum ('entrega', 'recoger');

create type public.metodo_pago as enum ('efectivo', 'transferencia');

-- ============================================================
-- Utilidades
-- ============================================================

create function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ============================================================
-- Perfiles
-- ============================================================

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '' check (char_length(nombre) <= 120),
  telefono text check (char_length(telefono) <= 20),
  rol public.rol_usuario not null default 'cliente',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create trigger perfiles_actualizado_en
before update on public.perfiles
for each row execute function public.tocar_actualizado_en();

-- Funciones auxiliares para RLS (security definer evita recursión de políticas).
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'admin'
  );
$$;

-- Crea el perfil al registrarse un usuario.
create function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, telefono)
  values (
    new.id,
    coalesce(left(new.raw_user_meta_data ->> 'nombre', 120), ''),
    left(new.raw_user_meta_data ->> 'telefono', 20)
  );
  return new;
end;
$$;

create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.crear_perfil_nuevo_usuario();

-- Solo un admin puede cambiar el rol.
create function public.proteger_rol_perfil()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.rol is distinct from old.rol and not public.es_admin()
     and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'Solo un administrador puede cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger perfiles_proteger_rol
before update on public.perfiles
for each row execute function public.proteger_rol_perfil();

alter table public.perfiles enable row level security;

create policy "perfiles: ver el propio o admin"
on public.perfiles for select
to authenticated
using (id = (select auth.uid()) or (select public.es_admin()));

create policy "perfiles: editar el propio o admin"
on public.perfiles for update
to authenticated
using (id = (select auth.uid()) or (select public.es_admin()))
with check (id = (select auth.uid()) or (select public.es_admin()));

-- ============================================================
-- Categorías
-- ============================================================

create table public.categorias (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nombre text not null check (char_length(nombre) between 1 and 80),
  orden int not null default 0,
  activa boolean not null default true
);

alter table public.categorias enable row level security;

create policy "categorias: todos ven las activas"
on public.categorias for select
to anon, authenticated
using (activa or (select public.es_admin()));

create policy "categorias: admin inserta"
on public.categorias for insert
to authenticated
with check ((select public.es_admin()));

create policy "categorias: admin edita"
on public.categorias for update
to authenticated
using ((select public.es_admin()))
with check ((select public.es_admin()));

create policy "categorias: admin borra"
on public.categorias for delete
to authenticated
using ((select public.es_admin()));

-- ============================================================
-- Negocios
-- ============================================================

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references public.perfiles (id) on delete restrict,
  categoria_id bigint references public.categorias (id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nombre text not null check (char_length(nombre) between 1 and 120),
  descripcion text check (char_length(descripcion) <= 1000),
  telefono text check (char_length(telefono) <= 20),
  whatsapp text check (char_length(whatsapp) <= 20),
  direccion text check (char_length(direccion) <= 300),
  horario text check (char_length(horario) <= 300),
  logo_url text,
  estado public.estado_negocio not null default 'pendiente',
  abierto boolean not null default true,
  acepta_entrega boolean not null default true,
  acepta_recoger boolean not null default true,
  costo_envio numeric(10, 2) not null default 0 check (costo_envio >= 0),
  pedido_minimo numeric(10, 2) not null default 0 check (pedido_minimo >= 0),
  datos_transferencia text check (char_length(datos_transferencia) <= 300),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (acepta_entrega or acepta_recoger)
);

create index negocios_propietario_idx on public.negocios (propietario_id);
create index negocios_categoria_idx on public.negocios (categoria_id);
create index negocios_estado_idx on public.negocios (estado);

create trigger negocios_actualizado_en
before update on public.negocios
for each row execute function public.tocar_actualizado_en();

create function public.es_dueno_negocio(p_negocio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.negocios
    where id = p_negocio_id and propietario_id = (select auth.uid())
  );
$$;

-- El dueño no puede aprobarse ni cambiar de propietario; un negocio nuevo siempre nace pendiente.
create function public.proteger_negocio()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.es_admin()
     or current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.estado := 'pendiente';
  else
    if new.estado is distinct from old.estado then
      raise exception 'Solo un administrador puede cambiar el estado del negocio';
    end if;
    if new.propietario_id is distinct from old.propietario_id then
      raise exception 'No se puede cambiar el propietario del negocio';
    end if;
  end if;
  return new;
end;
$$;

create trigger negocios_proteger
before insert or update on public.negocios
for each row execute function public.proteger_negocio();

-- Al aprobar un negocio, su propietario pasa a rol "negocio" (si era cliente).
create function public.asignar_rol_negocio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.estado = 'aprobado' and old.estado is distinct from 'aprobado' then
    update public.perfiles
    set rol = 'negocio'
    where id = new.propietario_id and rol = 'cliente';
  end if;
  return new;
end;
$$;

create trigger negocios_asignar_rol
after update of estado on public.negocios
for each row execute function public.asignar_rol_negocio();

alter table public.negocios enable row level security;

create policy "negocios: todos ven los aprobados; dueño y admin ven todos"
on public.negocios for select
to anon, authenticated
using (
  estado = 'aprobado'
  or propietario_id = (select auth.uid())
  or (select public.es_admin())
);

create policy "negocios: usuario registra el suyo"
on public.negocios for insert
to authenticated
with check (propietario_id = (select auth.uid()));

create policy "negocios: dueño o admin edita"
on public.negocios for update
to authenticated
using (propietario_id = (select auth.uid()) or (select public.es_admin()))
with check (propietario_id = (select auth.uid()) or (select public.es_admin()));

create policy "negocios: admin borra"
on public.negocios for delete
to authenticated
using ((select public.es_admin()));

-- ============================================================
-- Productos
-- ============================================================

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 120),
  descripcion text check (char_length(descripcion) <= 500),
  precio numeric(10, 2) not null check (precio >= 0),
  imagen_url text,
  disponible boolean not null default true,
  orden int not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index productos_negocio_idx on public.productos (negocio_id);

create trigger productos_actualizado_en
before update on public.productos
for each row execute function public.tocar_actualizado_en();

alter table public.productos enable row level security;

create policy "productos: todos ven los de negocios aprobados; dueño y admin ven todos"
on public.productos for select
to anon, authenticated
using (
  (
    disponible
    and exists (
      select 1 from public.negocios n
      where n.id = negocio_id and n.estado = 'aprobado'
    )
  )
  or (select public.es_dueno_negocio(negocio_id))
  or (select public.es_admin())
);

create policy "productos: dueño o admin crea"
on public.productos for insert
to authenticated
with check ((select public.es_dueno_negocio(negocio_id)) or (select public.es_admin()));

create policy "productos: dueño o admin edita"
on public.productos for update
to authenticated
using ((select public.es_dueno_negocio(negocio_id)) or (select public.es_admin()))
with check ((select public.es_dueno_negocio(negocio_id)) or (select public.es_admin()));

create policy "productos: dueño o admin borra"
on public.productos for delete
to authenticated
using ((select public.es_dueno_negocio(negocio_id)) or (select public.es_admin()));

-- ============================================================
-- Pedidos
-- ============================================================

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  folio bigint generated always as identity unique,
  cliente_id uuid not null references public.perfiles (id) on delete restrict,
  negocio_id uuid not null references public.negocios (id) on delete restrict,
  estado public.estado_pedido not null default 'recibido',
  modalidad public.modalidad_entrega not null,
  metodo_pago public.metodo_pago not null,
  nombre_contacto text not null check (char_length(nombre_contacto) between 1 and 120),
  telefono_contacto text not null check (char_length(telefono_contacto) between 7 and 20),
  direccion_entrega text check (char_length(direccion_entrega) <= 300),
  notas text check (char_length(notas) <= 500),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  costo_envio numeric(10, 2) not null default 0 check (costo_envio >= 0),
  total numeric(10, 2) not null check (total >= 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (modalidad = 'recoger' or direccion_entrega is not null)
);

create index pedidos_cliente_idx on public.pedidos (cliente_id, creado_en desc);
create index pedidos_negocio_idx on public.pedidos (negocio_id, creado_en desc);

create trigger pedidos_actualizado_en
before update on public.pedidos
for each row execute function public.tocar_actualizado_en();

create table public.pedido_detalle (
  id bigint generated always as identity primary key,
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  producto_id uuid references public.productos (id) on delete set null,
  nombre_producto text not null,
  precio_unitario numeric(10, 2) not null check (precio_unitario >= 0),
  cantidad int not null check (cantidad between 1 and 99),
  importe numeric(10, 2) generated always as (precio_unitario * cantidad) stored
);

create index pedido_detalle_pedido_idx on public.pedido_detalle (pedido_id);

create table public.pedido_historial (
  id bigint generated always as identity primary key,
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  estado public.estado_pedido not null,
  cambiado_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now()
);

create index pedido_historial_pedido_idx on public.pedido_historial (pedido_id, creado_en);

-- Registra cada estado (incluido el inicial) en el historial.
create function public.registrar_historial_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.estado is distinct from old.estado then
    insert into public.pedido_historial (pedido_id, estado, cambiado_por)
    values (new.id, new.estado, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger pedidos_historial
after insert or update of estado on public.pedidos
for each row execute function public.registrar_historial_pedido();

alter table public.pedidos enable row level security;
alter table public.pedido_detalle enable row level security;
alter table public.pedido_historial enable row level security;

-- Lectura: el cliente ve los suyos, el negocio los que recibe, el admin todos.
-- Sin políticas de insert/update/delete: solo se modifican con las funciones de abajo.
create policy "pedidos: cliente, negocio o admin ven"
on public.pedidos for select
to authenticated
using (
  cliente_id = (select auth.uid())
  or (select public.es_dueno_negocio(negocio_id))
  or (select public.es_admin())
);

create policy "pedido_detalle: quien ve el pedido ve su detalle"
on public.pedido_detalle for select
to authenticated
using (exists (select 1 from public.pedidos p where p.id = pedido_id));

create policy "pedido_historial: quien ve el pedido ve su historial"
on public.pedido_historial for select
to authenticated
using (exists (select 1 from public.pedidos p where p.id = pedido_id));

-- ============================================================
-- Funciones de pedidos
-- ============================================================

-- Crea un pedido. Los precios se toman de la base de datos, nunca del navegador.
-- p_productos: [{"producto_id": "uuid", "cantidad": 2}, ...]
create function public.crear_pedido(
  p_negocio_id uuid,
  p_modalidad public.modalidad_entrega,
  p_metodo_pago public.metodo_pago,
  p_nombre_contacto text,
  p_telefono_contacto text,
  p_productos jsonb,
  p_direccion_entrega text default null,
  p_notas text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := (select auth.uid());
  v_negocio public.negocios%rowtype;
  v_pedido_id uuid;
  v_subtotal numeric(10, 2);
  v_envio numeric(10, 2);
  v_lineas int;
  v_validas int;
  v_invalidas int;
begin
  if v_usuario is null then
    raise exception 'Debes iniciar sesión para hacer un pedido';
  end if;

  select * into v_negocio from public.negocios where id = p_negocio_id;
  if not found or v_negocio.estado <> 'aprobado' then
    raise exception 'El negocio no está disponible';
  end if;
  if not v_negocio.abierto then
    raise exception 'El negocio está cerrado en este momento';
  end if;
  if p_modalidad = 'entrega' and not v_negocio.acepta_entrega then
    raise exception 'Este negocio no ofrece entrega a domicilio';
  end if;
  if p_modalidad = 'recoger' and not v_negocio.acepta_recoger then
    raise exception 'Este negocio no ofrece recoger en tienda';
  end if;
  if p_modalidad = 'entrega' and coalesce(trim(p_direccion_entrega), '') = '' then
    raise exception 'Indica la dirección de entrega';
  end if;

  if p_productos is null or jsonb_typeof(p_productos) <> 'array'
     or jsonb_array_length(p_productos) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  -- Agrupa por producto y valida que todos existan, estén disponibles y sean del negocio.
  with lineas as (
    select (e ->> 'producto_id')::uuid as producto_id,
           sum((e ->> 'cantidad')::int)::int as cantidad
    from jsonb_array_elements(p_productos) e
    group by 1
  )
  select count(*),
         count(*) filter (where cantidad is null or cantidad not between 1 and 99)
  into v_lineas, v_invalidas
  from lineas;

  if v_invalidas > 0 then
    raise exception 'Cantidad no válida';
  end if;

  with lineas as (
    select (e ->> 'producto_id')::uuid as producto_id,
           sum((e ->> 'cantidad')::int)::int as cantidad
    from jsonb_array_elements(p_productos) e
    group by 1
  )
  select count(*), coalesce(sum(pr.precio * l.cantidad), 0)
  into v_validas, v_subtotal
  from lineas l
  join public.productos pr on pr.id = l.producto_id
  where pr.negocio_id = p_negocio_id and pr.disponible;

  if v_validas <> v_lineas then
    raise exception 'Algún producto ya no está disponible';
  end if;
  if v_subtotal < v_negocio.pedido_minimo then
    raise exception 'El pedido mínimo es de $%', v_negocio.pedido_minimo;
  end if;

  v_envio := case when p_modalidad = 'entrega' then v_negocio.costo_envio else 0 end;

  insert into public.pedidos (
    cliente_id, negocio_id, modalidad, metodo_pago,
    nombre_contacto, telefono_contacto, direccion_entrega, notas,
    subtotal, costo_envio, total
  ) values (
    v_usuario, p_negocio_id, p_modalidad, p_metodo_pago,
    trim(p_nombre_contacto), trim(p_telefono_contacto),
    case when p_modalidad = 'entrega' then trim(p_direccion_entrega) end,
    nullif(trim(p_notas), ''),
    v_subtotal, v_envio, v_subtotal + v_envio
  )
  returning id into v_pedido_id;

  insert into public.pedido_detalle (pedido_id, producto_id, nombre_producto, precio_unitario, cantidad)
  select v_pedido_id, pr.id, pr.nombre, pr.precio, l.cantidad
  from (
    select (e ->> 'producto_id')::uuid as producto_id,
           sum((e ->> 'cantidad')::int)::int as cantidad
    from jsonb_array_elements(p_productos) e
    group by 1
  ) l
  join public.productos pr on pr.id = l.producto_id;

  return v_pedido_id;
end;
$$;

-- Cambia el estado de un pedido respetando quién puede hacer cada cambio.
--   Cliente: recibido -> cancelado
--   Negocio: recibido -> aceptado | rechazado
--            aceptado -> en_preparacion | cancelado
--            en_preparacion -> listo
--            listo -> en_camino (solo entrega) | entregado
--            en_camino -> entregado
--   Admin:   cualquier cambio
create function public.cambiar_estado_pedido(
  p_pedido_id uuid,
  p_estado public.estado_pedido
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := (select auth.uid());
  v_pedido public.pedidos%rowtype;
  v_permitido boolean := false;
begin
  if v_usuario is null then
    raise exception 'Debes iniciar sesión';
  end if;

  select * into v_pedido from public.pedidos where id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if public.es_admin() then
    v_permitido := true;
  elsif public.es_dueno_negocio(v_pedido.negocio_id) then
    v_permitido := (v_pedido.estado, p_estado) in (
      ('recibido'::public.estado_pedido, 'aceptado'::public.estado_pedido),
      ('recibido', 'rechazado'),
      ('aceptado', 'en_preparacion'),
      ('aceptado', 'cancelado'),
      ('en_preparacion', 'listo'),
      ('listo', 'entregado'),
      ('en_camino', 'entregado')
    ) or (
      v_pedido.estado = 'listo' and p_estado = 'en_camino'
      and v_pedido.modalidad = 'entrega'
    );
  elsif v_pedido.cliente_id = v_usuario then
    v_permitido := v_pedido.estado = 'recibido' and p_estado = 'cancelado';
  end if;

  if not v_permitido then
    raise exception 'No puedes cambiar el pedido de "%" a "%"', v_pedido.estado, p_estado;
  end if;

  update public.pedidos set estado = p_estado where id = p_pedido_id;
end;
$$;

-- ============================================================
-- Permisos de funciones
-- ============================================================

revoke execute on function public.crear_pedido from public, anon;
revoke execute on function public.cambiar_estado_pedido from public, anon;
grant execute on function public.crear_pedido to authenticated;
grant execute on function public.cambiar_estado_pedido to authenticated;

-- Las funciones de triggers no deben llamarse directamente.
revoke execute on function public.crear_perfil_nuevo_usuario from public, anon, authenticated;
revoke execute on function public.asignar_rol_negocio from public, anon, authenticated;
revoke execute on function public.registrar_historial_pedido from public, anon, authenticated;
