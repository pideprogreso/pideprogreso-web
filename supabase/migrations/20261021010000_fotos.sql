-- Fotos de negocios y productos en Supabase Storage.
-- Cada archivo va en una carpeta con el id del negocio: "<negocio_id>/<archivo>".
-- Cualquiera puede verlas (bucket público); solo el dueño del negocio o un admin
-- sube, cambia o borra.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create function public.puede_editar_foto(p_nombre text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when split_part(p_nombre, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.es_dueno_negocio(split_part(p_nombre, '/', 1)::uuid) or public.es_admin()
    else false
  end;
$$;

create policy "fotos: dueño o admin ve las de su negocio"
on storage.objects for select
to authenticated
using (bucket_id = 'fotos' and public.puede_editar_foto(name));

create policy "fotos: dueño o admin sube"
on storage.objects for insert
to authenticated
with check (bucket_id = 'fotos' and public.puede_editar_foto(name));

create policy "fotos: dueño o admin cambia"
on storage.objects for update
to authenticated
using (bucket_id = 'fotos' and public.puede_editar_foto(name))
with check (bucket_id = 'fotos' and public.puede_editar_foto(name));

create policy "fotos: dueño o admin borra"
on storage.objects for delete
to authenticated
using (bucket_id = 'fotos' and public.puede_editar_foto(name));
