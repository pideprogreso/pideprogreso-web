-- Registro de quién aceptó qué documento legal, cuándo y qué versión.
-- 'terminos': términos y aviso de privacidad. Toda cuenta nueva pasa por la leyenda (correo o Google): se registra al crearse.
-- 'negocios': acuerdo para negocios. El registro de negocio exige marcarlo: se registra al crear el negocio.

create table public.aceptaciones_legales (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  documento text not null check (documento in ('terminos', 'negocios')),
  version text not null,
  aceptado_en timestamptz not null default now()
);

create index aceptaciones_legales_usuario_idx on public.aceptaciones_legales (usuario_id);

alter table public.aceptaciones_legales enable row level security;

create policy "aceptaciones: cada quien ve las suyas, admin todas"
on public.aceptaciones_legales for select
to authenticated
using (usuario_id = (select auth.uid()) or (select public.es_admin()));

-- Versión vigente = fecha de "actualizado" del documento. Al cambiar un documento, actualiza su fecha aquí.
-- 'terminos' es la más reciente entre /terminos y /privacidad; 'negocios' es /acuerdo-negocios.
create function public.version_legal(documento text)
returns text
language sql
immutable
set search_path = ''
as $$ select case documento when 'terminos' then '2026-11-18' when 'negocios' then '2026-11-18' end $$;

create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, telefono)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'nombre', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ), 120),
    left(new.raw_user_meta_data ->> 'telefono', 20)
  );
  insert into public.aceptaciones_legales (usuario_id, documento, version)
  values (new.id, 'terminos', public.version_legal('terminos'));
  return new;
end;
$$;

create function public.registrar_acuerdo_negocio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.aceptaciones_legales (usuario_id, documento, version)
  values (new.propietario_id, 'negocios', public.version_legal('negocios'));
  return new;
end;
$$;

create trigger al_crear_negocio_acuerdo
after insert on public.negocios
for each row execute function public.registrar_acuerdo_negocio();

-- Cuentas creadas desde que existe la leyenda (21 de octubre) aceptaron la versión de esa fecha.
insert into public.aceptaciones_legales (usuario_id, documento, version, aceptado_en)
select id, 'terminos', '2026-10-21', created_at from auth.users where created_at >= '2026-10-21';
