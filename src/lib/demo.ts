import type { Negocio, Producto } from "./tipos";

// Negocios de ejemplo. Se usan cuando Supabase no está configurado.
// supabase/seed-demo.sql carga estos mismos datos en la base.

const base = {
  descripcion: null,
  direccion: null,
  horario: null,
  telefono: null,
  logoUrl: null,
  portadaUrl: null,
  abierto: true,
  aceptaEntrega: true,
  aceptaRecoger: true,
  pedidoMinimo: 0,
};

export const NEGOCIOS_DEMO: Negocio[] = [
  {
    ...base,
    id: "demo-burger",
    portadaUrl: "/demo/hamburguesa.jpg",
    slug: "la-parrilla-del-norte",
    nombre: "La Parrilla del Norte",
    descripcion: "Hamburguesas al carbón, papas y malteadas.",
    categoria: "comida",
    direccion: "Calle Benito Juárez",
    horario: "Todos los días, 1:00 a 11:00 p. m.",
    costoEnvio: 25,
    tiempoMin: 25,
    tiempoMax: 40,
  },
  {
    ...base,
    id: "demo-tacos",
    portadaUrl: "/demo/tacos.jpg",
    slug: "taqueria-la-frontera",
    nombre: "Taquería La Frontera",
    descripcion: "Tacos de trompo, bistec y tripa. Salsas de la casa.",
    categoria: "taquerias",
    horario: "Martes a domingo, 6:00 p. m. a 1:00 a. m.",
    costoEnvio: 20,
    tiempoMin: 20,
    tiempoMax: 35,
  },
  {
    ...base,
    id: "demo-pizza",
    portadaUrl: "/demo/pizza-2.jpg",
    slug: "pizzeria-don-chuy",
    nombre: "Pizzería Don Chuy",
    descripcion: "Pizza artesanal en horno de piedra.",
    categoria: "pizzerias",
    costoEnvio: 0,
    pedidoMinimo: 150,
    tiempoMin: 35,
    tiempoMax: 50,
  },
  {
    ...base,
    id: "demo-pan",
    portadaUrl: "/demo/pan.jpg",
    slug: "panaderia-el-trigal",
    nombre: "Panadería El Trigal",
    descripcion: "Pan dulce recién horneado, pasteles por encargo.",
    categoria: "panaderias",
    costoEnvio: 15,
    tiempoMin: 15,
    tiempoMax: 30,
  },
  {
    ...base,
    id: "demo-super",
    portadaUrl: "/demo/super.jpg",
    slug: "minisuper-la-esquina",
    nombre: "Minisúper La Esquina",
    descripcion: "Abarrotes, bebidas frías y artículos de limpieza.",
    categoria: "abarrotes",
    costoEnvio: 20,
    tiempoMin: 20,
    tiempoMax: 40,
  },
  {
    ...base,
    id: "demo-flores",
    portadaUrl: "/demo/flores.jpg",
    slug: "floreria-jardin",
    nombre: "Florería Jardín",
    descripcion: "Ramos y arreglos para toda ocasión.",
    categoria: "florerias",
    aceptaEntrega: true,
    costoEnvio: 40,
    tiempoMin: 45,
    tiempoMax: 70,
    abierto: false,
  },
];

let n = 0;
function p(
  negocioId: string,
  seccion: string,
  nombre: string,
  precio: number,
  descripcion: string | null = null,
  foto: string | null = null,
): Producto {
  n += 1;
  return {
    id: `${negocioId}-p${n}`,
    negocioId,
    seccion,
    nombre,
    precio,
    descripcion,
    imagenUrl: foto ? `/demo/${foto}.jpg` : null,
  };
}

export const PRODUCTOS_DEMO: Producto[] = [
  p("demo-burger", "Hamburguesas", "Hamburguesa clásica", 95, "Carne de res al carbón, queso americano, lechuga, tomate y cebolla.", "hamburguesa"),
  p("demo-burger", "Hamburguesas", "Doble con tocino", 135, "Dos carnes, doble queso, tocino y salsa de la casa.", "hamburguesa-doble"),
  p("demo-burger", "Hamburguesas", "Hawaiana", 110, "Con piña asada, jamón y queso manchego."),
  p("demo-burger", "Complementos", "Papas a la francesa", 45, "Porción grande, con sal de grano.", "papas"),
  p("demo-burger", "Complementos", "Aros de cebolla", 55),
  p("demo-burger", "Bebidas", "Malteada de chocolate", 60, "Con helado de vainilla y jarabe de chocolate.", "malteada"),
  p("demo-burger", "Bebidas", "Refresco 600 ml", 25),

  p("demo-tacos", "Tacos", "Orden de trompo (5)", 75, "Con cebolla, cilantro y piña.", "tacos-2"),
  p("demo-tacos", "Tacos", "Orden de bistec (5)", 85, "Tortilla de maíz hecha a mano.", "tacos"),
  p("demo-tacos", "Tacos", "Orden de tripa (5)", 95, "Bien doradita."),
  p("demo-tacos", "Especiales", "Gringa de trompo", 70, "Tortilla de harina, queso y trompo."),
  p("demo-tacos", "Bebidas", "Agua fresca de sandía 1 L", 35, "Hecha al momento con sandía natural.", "agua-fresca"),

  p("demo-pizza", "Pizzas", "Pepperoni grande", 199, "Ocho rebanadas, mozzarella y pepperoni.", "pizza"),
  p("demo-pizza", "Pizzas", "Mexicana grande", 219, "Chorizo, jalapeño, cebolla y frijol."),
  p("demo-pizza", "Pizzas", "Cuatro quesos grande", 229, "Mozzarella, manchego, parmesano y queso azul.", "pizza-2"),
  p("demo-pizza", "Entradas", "Pan de ajo", 59),

  p("demo-pan", "Pan dulce", "Concha", 14),
  p("demo-pan", "Pan dulce", "Cuernito", 14, "Hojaldrado, recién horneado.", "croissant"),
  p("demo-pan", "Pan dulce", "Marranito", 12),
  p("demo-pan", "Pasteles", "Pastel de tres leches (rebanada)", 55, null, "pastel"),

  p("demo-super", "Bebidas", "Agua natural 1.5 L", 18),
  p("demo-super", "Bebidas", "Bolsa de hielo 5 kg", 35),
  p("demo-super", "Despensa", "Tortillas de harina (paquete)", 38),
  p("demo-super", "Despensa", "Huevo (docena)", 48),

  p("demo-flores", "Ramos", "Ramo de tulipanes", 450, "Doce tulipanes con follaje y envoltura.", "flores-2"),
  p("demo-flores", "Ramos", "Arreglo de girasoles", 380, null, "flores"),
];
