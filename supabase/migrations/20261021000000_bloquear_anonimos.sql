-- Los clientes piden con sesión anónima (rol authenticated), así que las
-- políticas "to authenticated" también los incluyen. Un anónimo puede pedir
-- y cancelar, pero no registrar negocios.
--
-- Las demás políticas de escritura de negocios y productos exigen ser dueño
-- del negocio o admin; como un anónimo ya no puede registrar negocios, nunca
-- llega a ser dueño. perfiles: el anónimo solo edita su propio nombre/teléfono
-- (el rol está protegido por trigger).

create function public.es_anonimo()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

drop policy "negocios: usuario registra el suyo" on public.negocios;

create policy "negocios: usuario registra el suyo"
on public.negocios for insert
to authenticated
with check (
  propietario_id = (select auth.uid())
  and not (select public.es_anonimo())
);
