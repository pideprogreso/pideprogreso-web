-- Negocios que dejan sus datos en /proximamente para recibir el costo de la
-- suscripción y la forma de trabajo. Cualquiera se registra; solo admin lee.

create table public.interesados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  negocio text not null check (char_length(negocio) between 2 and 120),
  telefono text not null check (char_length(telefono) between 10 and 20),
  correo text check (char_length(correo) <= 120),
  giro text not null check (char_length(giro) between 2 and 60),
  contactado boolean not null default false,
  creado_en timestamptz not null default now()
);

create index interesados_pendientes_idx on public.interesados (contactado, creado_en desc);

alter table public.interesados enable row level security;

create policy "interesados: cualquiera se registra"
on public.interesados for insert
to anon, authenticated
with check (not contactado);

create policy "interesados: admin ve"
on public.interesados for select
to authenticated
using ((select public.es_admin()));

create policy "interesados: admin marca contactado"
on public.interesados for update
to authenticated
using ((select public.es_admin()))
with check ((select public.es_admin()));

create policy "interesados: admin borra"
on public.interesados for delete
to authenticated
using ((select public.es_admin()));

-- Freno contra spam, igual que en reportes: máximo 30 por hora en total.
create function public.limitar_interesados()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.interesados where creado_en > now() - interval '1 hour') >= 30 then
    raise exception 'Demasiados registros. Intenta más tarde.';
  end if;
  return new;
end;
$$;

create trigger interesados_limitar
before insert on public.interesados
for each row execute function public.limitar_interesados();

revoke execute on function public.limitar_interesados from public, anon, authenticated;
