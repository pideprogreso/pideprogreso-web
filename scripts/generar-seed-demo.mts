// Genera supabase/seed-demo.sql a partir de src/lib/demo.ts.
// Uso: node --experimental-strip-types scripts/generar-seed-demo.mts
import { writeFileSync } from "node:fs";
import { NEGOCIOS_DEMO, PRODUCTOS_DEMO } from "../src/lib/demo.ts";

const DUENO = "00000000-0000-4000-8000-0000000000de";
const uuidDe = (i: number) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
const t = (v: string | null) => (v === null ? "null" : `'${v.replace(/'/g, "''")}'`);

const ids = new Map(NEGOCIOS_DEMO.map((n, i) => [n.id, uuidDe(i)]));

const negocios = NEGOCIOS_DEMO.map(
  (n) => `  (${t(ids.get(n.id)!)}, '${DUENO}', (select id from public.categorias where slug = ${t(n.categoria)}), ${t(n.slug)}, ${t(n.nombre)}, ${t(n.descripcion)}, ${t(n.direccion)}, ${t(n.horario)}, ${t(n.portadaUrl)}, 'aprobado', ${n.abierto}, ${n.aceptaEntrega}, ${n.aceptaRecoger}, ${n.costoEnvio}, ${n.pedidoMinimo}, ${n.tiempoMin}, ${n.tiempoMax})`,
).join(",\n");

const productos = PRODUCTOS_DEMO.map(
  (p, i) => `  (${t(ids.get(p.negocioId)!)}, ${t(p.seccion)}, ${t(p.nombre)}, ${t(p.descripcion)}, ${p.precio}, ${t(p.imagenUrl)}, ${i})`,
).join(",\n");

const sql = `-- Negocios y productos de DEMOSTRACIÓN para ver la app con contenido.
-- Generado por scripts/generar-seed-demo.mts; no editar a mano.
-- Las fotos viven en public/demo (Unsplash, licencia libre).
-- Ejecutar en el SQL Editor de Supabase después de las migraciones y seed.sql.
--
-- Para quitarlos:
--   delete from public.productos where negocio_id in (select id from public.negocios where propietario_id = '${DUENO}');
--   delete from public.negocios where propietario_id = '${DUENO}';
--   delete from auth.users where id = '${DUENO}';

begin;

-- Dueño ficticio de los negocios de demostración (no puede iniciar sesión: no tiene contraseña).
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '${DUENO}', 'authenticated', 'authenticated', 'demo@pideprogreso.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Negocios de demostración"}', now(), now())
on conflict (id) do nothing;

insert into public.negocios (id, propietario_id, categoria_id, slug, nombre, descripcion, direccion, horario, portada_url, estado, abierto, acepta_entrega, acepta_recoger, costo_envio, pedido_minimo, tiempo_entrega_min, tiempo_entrega_max)
values
${negocios}
on conflict (id) do nothing;

-- Vuelve a cargar el menú completo de los negocios de demostración.
delete from public.productos where negocio_id in (select id from public.negocios where propietario_id = '${DUENO}');

insert into public.productos (negocio_id, seccion, nombre, descripcion, precio, imagen_url, orden)
values
${productos};

commit;
`;

writeFileSync(new URL("../supabase/seed-demo.sql", import.meta.url), sql);
console.log(`seed-demo.sql: ${NEGOCIOS_DEMO.length} negocios, ${PRODUCTOS_DEMO.length} productos`);
