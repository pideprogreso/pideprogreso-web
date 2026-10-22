-- Para cobrar: negocios destacados en el inicio y control de la cuota mensual.

-- Hasta cuándo sale el negocio primero en el inicio. Solo el admin lo pone.
alter table public.negocios add column destacado_hasta timestamptz;
-- negocios se lee por columnas (ver ocultar_datos_transferencia).
grant select (destacado_hasta) on public.negocios to anon, authenticated;

-- Igual que antes, y además el dueño no puede destacarse solo.
create or replace function public.proteger_negocio()
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
    new.destacado_hasta := null;
  else
    if new.estado is distinct from old.estado then
      raise exception 'Solo un administrador puede cambiar el estado del negocio';
    end if;
    if new.propietario_id is distinct from old.propietario_id then
      raise exception 'No se puede cambiar el propietario del negocio';
    end if;
    if new.destacado_hasta is distinct from old.destacado_hasta then
      raise exception 'Solo un administrador puede destacar un negocio';
    end if;
  end if;
  return new;
end;
$$;

-- Un pago por negocio y por mes. Solo el administrador lo ve y lo registra.
create table public.pagos_negocio (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete restrict,
  mes date not null check (extract(day from mes) = 1),
  monto numeric(10, 2) not null check (monto > 0 and monto <= 100000),
  metodo text not null check (metodo in ('transferencia', 'mercado_pago', 'efectivo')),
  registrado_por uuid references public.perfiles (id) default auth.uid(),
  creado_en timestamptz not null default now(),
  unique (negocio_id, mes)
);

alter table public.pagos_negocio enable row level security;

create policy "pagos_negocio: solo admin"
on public.pagos_negocio for all
to authenticated
using (public.es_admin())
with check (public.es_admin());
