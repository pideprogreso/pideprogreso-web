-- Paso 2: nadie lee datos_transferencia directo de la tabla; se usa
-- public.datos_transferencia(). Ojo: una columna nueva en negocios hay que
-- agregarla a este grant para que se pueda leer.

revoke select on public.negocios from anon, authenticated;

grant select (
  id, propietario_id, categoria_id, slug, nombre, descripcion, telefono, whatsapp,
  direccion, horario, logo_url, estado, abierto, acepta_entrega, acepta_recoger,
  costo_envio, pedido_minimo, creado_en, actualizado_en, portada_url,
  tiempo_entrega_min, tiempo_entrega_max
) on public.negocios to anon, authenticated;
