// Categorías iniciales. Deben coincidir con supabase/seed.sql.
// `fondo` es el tono de la ilustración cuando un negocio aún no sube fotos.
export const CATEGORIAS = [
  { slug: "comida", nombre: "Comida", icono: "🍔", fondo: "#F7D9C4" },
  { slug: "taquerias", nombre: "Tacos", icono: "🌮", fondo: "#F9E3A7" },
  { slug: "pizzerias", nombre: "Pizza", icono: "🍕", fondo: "#F6CFC9" },
  { slug: "abarrotes", nombre: "Súper", icono: "🛒", fondo: "#D7E8D3" },
  { slug: "panaderias", nombre: "Pan", icono: "🥐", fondo: "#F3DFC0" },
  { slug: "florerias", nombre: "Flores", icono: "💐", fondo: "#F5D3E0" },
  { slug: "articulos", nombre: "Tiendas", icono: "🛍️", fondo: "#DAD8F2" },
  { slug: "emprendedores", nombre: "De casa", icono: "🏠", fondo: "#D5E6EE" },
] as const;

export type SlugCategoria = (typeof CATEGORIAS)[number]["slug"];

export function buscarCategoria(slug: string | null | undefined) {
  return CATEGORIAS.find((c) => c.slug === slug);
}
