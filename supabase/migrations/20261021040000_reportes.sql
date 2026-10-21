-- Reportes de problemas que cualquiera puede mandar desde la app.
-- Solo los administradores los leen y los marcan como resueltos.

create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.perfiles (id) on delete set null,
  pagina text not null check (char_length(pagina) between 1 and 300),
  texto text not null check (char_length(texto) between 5 and 2000),
  contacto text check (char_length(contacto) <= 120),
  navegador text check (char_length(navegador) <= 300),
  resuelto boolean not null default false,
  creado_en timestamptz not null default now()
);

create index reportes_pendientes_idx on public.reportes (resuelto, creado_en desc);

alter table public.reportes enable row level security;

-- Sin sesión se guarda sin usuario; con sesión, solo a nombre propio.
create policy "reportes: cualquiera reporta"
on public.reportes for insert
to anon, authenticated
with check (
  not resuelto
  and (usuario_id is null or usuario_id = (select auth.uid()))
);

create policy "reportes: admin ve"
on public.reportes for select
to authenticated
using ((select public.es_admin()));

create policy "reportes: admin marca resuelto"
on public.reportes for update
to authenticated
using ((select public.es_admin()))
with check ((select public.es_admin()));

create policy "reportes: admin borra"
on public.reportes for delete
to authenticated
using ((select public.es_admin()));
