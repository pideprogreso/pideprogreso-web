-- Datos que muestran las tarjetas de negocio y el menú.

alter table public.negocios
  add column portada_url text,
  add column tiempo_entrega_min int not null default 20 check (tiempo_entrega_min between 0 and 240),
  add column tiempo_entrega_max int not null default 40 check (tiempo_entrega_max between 0 and 240),
  add constraint negocios_tiempo_entrega_rango check (tiempo_entrega_max >= tiempo_entrega_min);

-- Sección del menú en la que aparece el producto (p. ej. "Hamburguesas", "Bebidas").
alter table public.productos
  add column seccion text not null default 'Menú' check (char_length(seccion) between 1 and 60);

create index productos_negocio_seccion_idx on public.productos (negocio_id, seccion, orden);
