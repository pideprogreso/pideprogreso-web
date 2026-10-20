-- Categorías iniciales (coinciden con src/lib/categorias.ts)
insert into public.categorias (slug, nombre, orden) values
  ('comida', 'Comida y restaurantes', 1),
  ('taquerias', 'Taquerías', 2),
  ('pizzerias', 'Pizzerías', 3),
  ('abarrotes', 'Abarrotes y minisúper', 4),
  ('panaderias', 'Panaderías y repostería', 5),
  ('florerias', 'Florerías y regalos', 6),
  ('articulos', 'Artículos diversos', 7),
  ('emprendedores', 'Emprendedores desde casa', 8)
on conflict (slug) do nothing;
