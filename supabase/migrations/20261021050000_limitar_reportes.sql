-- Freno contra spam: cualquiera puede mandar reportes (incluso sin sesión y
-- directo a la API), así que se aceptan como máximo 30 por hora en total.

create function public.limitar_reportes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.reportes where creado_en > now() - interval '1 hour') >= 30 then
    raise exception 'Demasiados reportes. Intenta más tarde.';
  end if;
  return new;
end;
$$;

create trigger reportes_limitar
before insert on public.reportes
for each row execute function public.limitar_reportes();

revoke execute on function public.limitar_reportes from public, anon, authenticated;
