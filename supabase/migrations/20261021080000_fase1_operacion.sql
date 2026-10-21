-- Fase 1 de operación: pausa del negocio, límite de pedidos en curso por cliente
-- y cancelación automática de pedidos que nadie aceptó en 10 minutos.

-- El negocio puede pausar pedidos unos minutos sin cerrar (hora pico, lluvia).
alter table public.negocios add column pausado_hasta timestamptz;
-- negocios se lee por columnas (ver ocultar_datos_transferencia).
grant select (pausado_hasta) on public.negocios to anon, authenticated;

-- Por qué se canceló un pedido cuando no fue el cliente ni el negocio.
alter table public.pedidos add column motivo_cancelacion text
  check (motivo_cancelacion in ('sin_respuesta'));

create or replace function public.crear_pedido(
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
  if v_negocio.pausado_hasta > now() then
    raise exception 'El negocio pausó sus pedidos unos minutos por mucho trabajo. Intenta en un momento';
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

  -- Contra bromas y dobles envíos: máximo 3 pedidos sin terminar por cliente.
  if (
    select count(*) from public.pedidos
    where cliente_id = v_usuario
      and estado in ('recibido', 'aceptado', 'en_preparacion', 'listo', 'en_camino')
  ) >= 3 then
    raise exception 'Ya tienes 3 pedidos en curso. Espera a recibirlos para pedir otro';
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

-- Cancela los pedidos que el negocio no aceptó en 10 minutos.
create function public.cancelar_pedidos_sin_respuesta()
returns integer
language sql
security definer
set search_path = ''
as $$
  with cancelados as (
    update public.pedidos
    set estado = 'cancelado', motivo_cancelacion = 'sin_respuesta'
    where estado = 'recibido' and creado_en < now() - interval '10 minutes'
    returning 1
  )
  select count(*)::int from cancelados;
$$;

revoke execute on function public.cancelar_pedidos_sin_respuesta from public, anon, authenticated;

-- Corre cada minuto dentro de Supabase.
create extension if not exists pg_cron;
select cron.schedule(
  'cancelar-pedidos-sin-respuesta',
  '* * * * *',
  'select public.cancelar_pedidos_sin_respuesta()'
);
