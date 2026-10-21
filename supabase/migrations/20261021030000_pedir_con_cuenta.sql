-- Para pedir hay que tener cuenta (Google o correo), no sesión anónima.
-- El pedido guarda la ubicación del mapa y referencias; el cliente puede
-- guardar direcciones (casa, trabajo) para no escribirlas cada vez.

alter table public.pedidos
  add column referencias text check (char_length(referencias) <= 300),
  add column lat double precision check (lat between -90 and 90),
  add column lng double precision check (lng between -180 and 180),
  add constraint pedidos_ubicacion_completa check ((lat is null) = (lng is null));

create table public.direcciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  etiqueta text not null check (char_length(etiqueta) between 1 and 40),
  direccion text not null check (char_length(direccion) between 1 and 300),
  referencias text check (char_length(referencias) <= 300),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  creado_en timestamptz not null default now(),
  check ((lat is null) = (lng is null))
);

create index direcciones_usuario_idx on public.direcciones (usuario_id);

alter table public.direcciones enable row level security;

create policy "direcciones: cada quien ve las suyas"
on public.direcciones for select
to authenticated
using (usuario_id = (select auth.uid()));

create policy "direcciones: cada quien guarda las suyas"
on public.direcciones for insert
to authenticated
with check (usuario_id = (select auth.uid()) and not (select public.es_anonimo()));

create policy "direcciones: cada quien edita las suyas"
on public.direcciones for update
to authenticated
using (usuario_id = (select auth.uid()))
with check (usuario_id = (select auth.uid()));

create policy "direcciones: cada quien borra las suyas"
on public.direcciones for delete
to authenticated
using (usuario_id = (select auth.uid()));

drop function public.crear_pedido(
  uuid, public.modalidad_entrega, public.metodo_pago, text, text, jsonb, text, text
);

create function public.crear_pedido(
  p_negocio_id uuid,
  p_modalidad public.modalidad_entrega,
  p_metodo_pago public.metodo_pago,
  p_nombre_contacto text,
  p_telefono_contacto text,
  p_productos jsonb,
  p_direccion_entrega text default null,
  p_notas text default null,
  p_referencias text default null,
  p_lat double precision default null,
  p_lng double precision default null
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
  if v_usuario is null or public.es_anonimo() then
    raise exception 'Entra a tu cuenta para hacer tu pedido';
  end if;
  if (p_lat is null) <> (p_lng is null)
     or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'La ubicación no es válida';
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
    referencias, lat, lng,
    subtotal, costo_envio, total
  ) values (
    v_usuario, p_negocio_id, p_modalidad, p_metodo_pago,
    trim(p_nombre_contacto), trim(p_telefono_contacto),
    case when p_modalidad = 'entrega' then trim(p_direccion_entrega) end,
    nullif(trim(p_notas), ''),
    case when p_modalidad = 'entrega' then nullif(trim(p_referencias), '') end,
    case when p_modalidad = 'entrega' then p_lat end,
    case when p_modalidad = 'entrega' then p_lng end,
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

revoke execute on function public.crear_pedido from public, anon;
grant execute on function public.crear_pedido to authenticated;
