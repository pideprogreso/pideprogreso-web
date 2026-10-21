-- Con Google, el nombre llega en full_name o name, no en "nombre".

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
  return new;
end;
$$;

-- Completa el nombre de quienes ya entraron con Google.
update public.perfiles p
set nombre = left(coalesce(
  nullif(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'name', ''),
  ''
), 120)
from auth.users u
where u.id = p.id and p.nombre = '';
