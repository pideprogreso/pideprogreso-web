-- Avisos al celular (Web Push): pedido nuevo al negocio, cambios de estado al cliente
-- y alerta a administración si un pedido lleva 5 minutos sin que nadie lo acepte.
-- La base solo avisa al sitio (/api/avisos) con el id del pedido; el sitio decide
-- a quién y qué mandar, y la tabla avisos_enviados evita mandar dos veces lo mismo.

create table public.suscripciones_push (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  creado_en timestamptz not null default now()
);

create index suscripciones_push_usuario_idx on public.suscripciones_push (usuario_id);

alter table public.suscripciones_push enable row level security;

-- Cada quien guarda y borra solo las suyas. El sitio las lee con la llave secreta.
create policy "suscripciones_push: propias" on public.suscripciones_push
for all to authenticated
using (usuario_id = (select auth.uid()))
with check (usuario_id = (select auth.uid()));

-- Un aviso por pedido y motivo (estado o 'sin_respuesta'). Solo la llave secreta la usa.
create table public.avisos_enviados (
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  motivo text not null check (char_length(motivo) <= 30),
  creado_en timestamptz not null default now(),
  primary key (pedido_id, motivo)
);

alter table public.avisos_enviados enable row level security;

create extension if not exists pg_net;

create function public.llamar_avisos(p_pedido_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  select net.http_post(
    url := 'https://pideprogreso.netlify.app/api/avisos',
    body := jsonb_build_object('pedido_id', p_pedido_id),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 5000
  );
$$;

create function public.avisar_cambio_pedido()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.estado is distinct from old.estado then
    perform public.llamar_avisos(new.id);
  end if;
  return new;
end;
$$;

create trigger pedidos_avisos
after insert or update of estado on public.pedidos
for each row execute function public.avisar_cambio_pedido();

-- Cada minuto: pedidos con 5 a 10 minutos sin aceptar (a los 10 se cancelan solos).
select cron.schedule(
  'avisar-pedidos-sin-aceptar',
  '* * * * *',
  $$select public.llamar_avisos(p.id) from public.pedidos p
    where p.estado = 'recibido'
      and p.creado_en < now() - interval '5 minutes'
      and not exists (select 1 from public.avisos_enviados a where a.pedido_id = p.id and a.motivo = 'sin_respuesta')$$
);

revoke execute on function public.llamar_avisos from public, anon, authenticated;
revoke execute on function public.avisar_cambio_pedido from public, anon, authenticated;
