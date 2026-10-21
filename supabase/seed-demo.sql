-- Negocios y productos de DEMOSTRACIÓN para ver la app con contenido.
-- Generado por scripts/generar-seed-demo.mts; no editar a mano.
-- Las fotos viven en public/demo (Unsplash, licencia libre).
-- Ejecutar en el SQL Editor de Supabase después de las migraciones y seed.sql.
--
-- Para quitarlos:
--   delete from public.productos where negocio_id in (select id from public.negocios where propietario_id = '00000000-0000-4000-8000-0000000000de');
--   delete from public.negocios where propietario_id = '00000000-0000-4000-8000-0000000000de';
--   delete from auth.users where id = '00000000-0000-4000-8000-0000000000de';

begin;

-- Dueño ficticio de los negocios de demostración (no puede iniciar sesión: no tiene contraseña).
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-0000000000de', 'authenticated', 'authenticated', 'demo@pideprogreso.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{"nombre":"Negocios de demostración"}', now(), now())
on conflict (id) do nothing;

insert into public.negocios (id, propietario_id, categoria_id, slug, nombre, descripcion, direccion, horario, portada_url, estado, abierto, acepta_entrega, acepta_recoger, costo_envio, pedido_minimo, tiempo_entrega_min, tiempo_entrega_max)
values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-0000000000de', (select id from public.categorias where slug = 'comida'), 'la-parrilla-del-norte', 'La Parrilla del Norte', 'Hamburguesas al carbón, papas y malteadas.', 'Calle Benito Juárez', 'Todos los días, 1:00 a 11:00 p. m.', '/demo/hamburguesa.jpg', 'aprobado', true, true, true, 25, 0, 25, 40),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-0000000000de', (select id from public.categorias where slug = 'taquerias'), 'taqueria-la-frontera', 'Taquería La Frontera', 'Tacos de trompo, bistec y tripa. Salsas de la casa.', null, 'Martes a domingo, 6:00 p. m. a 1:00 a. m.', '/demo/tacos.jpg', 'aprobado', true, true, true, 20, 0, 20, 35),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-0000000000de', (select id from public.categorias where slug = 'pizzerias'), 'pizzeria-don-chuy', 'Pizzería Don Chuy', 'Pizza artesanal en horno de piedra.', null, null, '/demo/pizza-2.jpg', 'aprobado', true, true, true, 0, 150, 35, 50),
  ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-0000000000de', (select id from public.categorias where slug = 'panaderias'), 'panaderia-el-trigal', 'Panadería El Trigal', 'Pan dulce recién horneado, pasteles por encargo.', null, null, '/demo/pan.jpg', 'aprobado', true, true, true, 15, 0, 15, 30),
  ('00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-0000000000de', (select id from public.categorias where slug = 'abarrotes'), 'minisuper-la-esquina', 'Minisúper La Esquina', 'Abarrotes, bebidas frías y artículos de limpieza.', null, null, '/demo/super.jpg', 'aprobado', true, true, true, 20, 0, 20, 40),
  ('00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-0000000000de', (select id from public.categorias where slug = 'florerias'), 'floreria-jardin', 'Florería Jardín', 'Ramos y arreglos para toda ocasión.', null, null, '/demo/flores.jpg', 'aprobado', false, true, true, 40, 0, 45, 70)
on conflict (id) do nothing;

-- Vuelve a cargar el menú completo de los negocios de demostración.
delete from public.productos where negocio_id in (select id from public.negocios where propietario_id = '00000000-0000-4000-8000-0000000000de');

insert into public.productos (negocio_id, seccion, nombre, descripcion, precio, imagen_url, orden)
values
  ('00000000-0000-4000-8000-000000000001', 'Hamburguesas', 'Hamburguesa clásica', 'Carne de res al carbón, queso americano, lechuga, tomate y cebolla.', 95, '/demo/hamburguesa.jpg', 0),
  ('00000000-0000-4000-8000-000000000001', 'Hamburguesas', 'Doble con tocino', 'Dos carnes, doble queso, tocino y salsa de la casa.', 135, '/demo/hamburguesa-doble.jpg', 1),
  ('00000000-0000-4000-8000-000000000001', 'Hamburguesas', 'Hawaiana', 'Con piña asada, jamón y queso manchego.', 110, null, 2),
  ('00000000-0000-4000-8000-000000000001', 'Complementos', 'Papas a la francesa', 'Porción grande, con sal de grano.', 45, '/demo/papas.jpg', 3),
  ('00000000-0000-4000-8000-000000000001', 'Complementos', 'Aros de cebolla', null, 55, null, 4),
  ('00000000-0000-4000-8000-000000000001', 'Bebidas', 'Malteada de fresa', 'Con helado de vainilla y fresas naturales.', 60, '/demo/malteada.jpg', 5),
  ('00000000-0000-4000-8000-000000000001', 'Bebidas', 'Refresco 600 ml', null, 25, null, 6),
  ('00000000-0000-4000-8000-000000000002', 'Tacos', 'Orden de trompo (5)', 'Con cebolla, cilantro y piña.', 75, '/demo/tacos-2.jpg', 7),
  ('00000000-0000-4000-8000-000000000002', 'Tacos', 'Orden de bistec (5)', 'Tortilla de maíz hecha a mano.', 85, '/demo/tacos.jpg', 8),
  ('00000000-0000-4000-8000-000000000002', 'Tacos', 'Orden de tripa (5)', 'Bien doradita.', 95, null, 9),
  ('00000000-0000-4000-8000-000000000002', 'Especiales', 'Gringa de trompo', 'Tortilla de harina, queso y trompo.', 70, null, 10),
  ('00000000-0000-4000-8000-000000000002', 'Bebidas', 'Agua de horchata 1 L', null, 35, '/demo/agua-fresca.jpg', 11),
  ('00000000-0000-4000-8000-000000000003', 'Pizzas', 'Pepperoni grande', 'Ocho rebanadas, mozzarella y pepperoni.', 199, '/demo/pizza.jpg', 12),
  ('00000000-0000-4000-8000-000000000003', 'Pizzas', 'Mexicana grande', 'Chorizo, jalapeño, cebolla y frijol.', 219, null, 13),
  ('00000000-0000-4000-8000-000000000003', 'Pizzas', 'Cuatro quesos grande', 'Mozzarella, manchego, parmesano y queso azul.', 229, '/demo/pizza-2.jpg', 14),
  ('00000000-0000-4000-8000-000000000003', 'Entradas', 'Pan de ajo', null, 59, null, 15),
  ('00000000-0000-4000-8000-000000000004', 'Pan dulce', 'Concha', null, 14, null, 16),
  ('00000000-0000-4000-8000-000000000004', 'Pan dulce', 'Cuernito', 'Hojaldrado, recién horneado.', 14, '/demo/croissant.jpg', 17),
  ('00000000-0000-4000-8000-000000000004', 'Pan dulce', 'Marranito', null, 12, null, 18),
  ('00000000-0000-4000-8000-000000000004', 'Pasteles', 'Pastel de tres leches (rebanada)', null, 55, '/demo/pastel.jpg', 19),
  ('00000000-0000-4000-8000-000000000005', 'Bebidas', 'Agua natural 1.5 L', null, 18, null, 20),
  ('00000000-0000-4000-8000-000000000005', 'Bebidas', 'Bolsa de hielo 5 kg', null, 35, null, 21),
  ('00000000-0000-4000-8000-000000000005', 'Despensa', 'Tortillas de harina (paquete)', null, 38, null, 22),
  ('00000000-0000-4000-8000-000000000005', 'Despensa', 'Huevo (docena)', null, 48, null, 23),
  ('00000000-0000-4000-8000-000000000006', 'Ramos', 'Ramo de 12 rosas', 'Rosas rojas con follaje y envoltura.', 450, '/demo/flores-2.jpg', 24),
  ('00000000-0000-4000-8000-000000000006', 'Ramos', 'Arreglo de girasoles', null, 380, '/demo/flores.jpg', 25);

commit;
