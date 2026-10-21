// Categorías iniciales. Los slugs coinciden con supabase/seed.sql.
// `foto` es una imagen de public/demo; sin foto se muestra el ícono.
export const CATEGORIAS = [
  { slug: "comida", nombre: "Comida", foto: "/demo/hamburguesa.jpg" },
  { slug: "taquerias", nombre: "Tacos", foto: "/demo/tacos.jpg" },
  { slug: "pizzerias", nombre: "Pizza", foto: "/demo/pizza.jpg" },
  { slug: "panaderias", nombre: "Panadería", foto: "/demo/pan.jpg" },
  { slug: "abarrotes", nombre: "Súper", foto: "/demo/super.jpg" },
  { slug: "florerias", nombre: "Flores", foto: "/demo/flores.jpg" },
  { slug: "emprendedores", nombre: "Hecho en casa", foto: "/demo/pastel.jpg" },
  { slug: "articulos", nombre: "Tiendas", foto: null },
] as const;

export type SlugCategoria = (typeof CATEGORIAS)[number]["slug"];

export function buscarCategoria(slug: string | null | undefined) {
  return CATEGORIAS.find((c) => c.slug === slug);
}
