-- Los datos de transferencia (cuenta, CLABE) solo los ve el dueño del negocio,
-- un admin o quien ya le hizo un pedido. Paso 1: la función que los entrega.
-- Paso 2 (siguiente migración) quita la columna de la lectura pública.

create function public.datos_transferencia(p_negocio_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select n.datos_transferencia
  from public.negocios n
  where n.id = p_negocio_id
    and (
      n.propietario_id = (select auth.uid())
      or public.es_admin()
      or exists (
        select 1 from public.pedidos p
        where p.negocio_id = n.id and p.cliente_id = (select auth.uid())
      )
    );
$$;

revoke execute on function public.datos_transferencia from public, anon;
grant execute on function public.datos_transferencia to authenticated;
