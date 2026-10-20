// Categorías iniciales. Deben coincidir con supabase/seed.sql.
export const CATEGORIAS = [
  { slug: "comida", nombre: "Comida y restaurantes", icono: "🍔" },
  { slug: "taquerias", nombre: "Taquerías", icono: "🌮" },
  { slug: "pizzerias", nombre: "Pizzerías", icono: "🍕" },
  { slug: "abarrotes", nombre: "Abarrotes y minisúper", icono: "🛒" },
  { slug: "panaderias", nombre: "Panaderías y repostería", icono: "🥐" },
  { slug: "florerias", nombre: "Florerías y regalos", icono: "💐" },
  { slug: "articulos", nombre: "Artículos diversos", icono: "🛍️" },
  { slug: "emprendedores", nombre: "Emprendedores desde casa", icono: "🏠" },
] as const;
