import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { buscarCategoria } from "./categorias";
import { NEGOCIOS_DEMO, PRODUCTOS_DEMO } from "./demo";
import { normalizar } from "./formato";
import { supabaseConfigurado } from "./supabase/config";
import { crearClientePublico } from "./supabase/publico";
import type { Negocio, Producto } from "./tipos";

export const modoDemo = !supabaseConfigurado;

// Las acciones del panel llaman updateTag(TAG_NEGOCIOS) para que los cambios se vean al momento.
export const TAG_NEGOCIOS = "negocios";

export const COLUMNAS_NEGOCIO =
  "id, slug, nombre, descripcion, direccion, horario, telefono, whatsapp, datos_transferencia, logo_url, portada_url, abierto, acepta_entrega, acepta_recoger, costo_envio, pedido_minimo, tiempo_entrega_min, tiempo_entrega_max, categorias(slug)";

export type FilaNegocio = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  horario: string | null;
  telefono: string | null;
  whatsapp: string | null;
  datos_transferencia: string | null;
  logo_url: string | null;
  portada_url: string | null;
  abierto: boolean;
  acepta_entrega: boolean;
  acepta_recoger: boolean;
  costo_envio: number | string;
  pedido_minimo: number | string;
  tiempo_entrega_min: number;
  tiempo_entrega_max: number;
  categorias: { slug: string } | null;
};

export type FilaProducto = {
  id: string;
  negocio_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
  imagen_url: string | null;
  seccion: string;
};

export function aNegocio(f: FilaNegocio): Negocio {
  return {
    id: f.id,
    slug: f.slug,
    nombre: f.nombre,
    descripcion: f.descripcion,
    categoria: f.categorias?.slug ?? null,
    direccion: f.direccion,
    horario: f.horario,
    telefono: f.telefono,
    whatsapp: f.whatsapp,
    datosTransferencia: f.datos_transferencia,
    logoUrl: f.logo_url,
    portadaUrl: f.portada_url,
    abierto: f.abierto,
    aceptaEntrega: f.acepta_entrega,
    aceptaRecoger: f.acepta_recoger,
    costoEnvio: Number(f.costo_envio),
    pedidoMinimo: Number(f.pedido_minimo),
    tiempoMin: f.tiempo_entrega_min,
    tiempoMax: f.tiempo_entrega_max,
  };
}

export function aProducto(f: FilaProducto): Producto {
  return {
    id: f.id,
    negocioId: f.negocio_id,
    nombre: f.nombre,
    descripcion: f.descripcion,
    precio: Number(f.precio),
    imagenUrl: f.imagen_url,
    seccion: f.seccion,
  };
}

// Abiertos primero, luego por nombre.
function ordenar(negocios: Negocio[]) {
  return [...negocios].sort(
    (a, b) => Number(b.abierto) - Number(a.abierto) || a.nombre.localeCompare(b.nombre, "es"),
  );
}

export async function obtenerNegocios(): Promise<Negocio[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_NEGOCIOS);

  if (modoDemo) return ordenar(NEGOCIOS_DEMO);

  const { data, error } = await crearClientePublico()
    .from("negocios")
    .select(COLUMNAS_NEGOCIO)
    .eq("estado", "aprobado")
    .returns<FilaNegocio[]>();
  if (error) throw error;
  return ordenar(data.map(aNegocio));
}

export async function obtenerNegocio(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_NEGOCIOS);

  if (modoDemo) {
    const negocio = NEGOCIOS_DEMO.find((n) => n.slug === slug);
    if (!negocio) return null;
    return {
      negocio,
      productos: PRODUCTOS_DEMO.filter((p) => p.negocioId === negocio.id),
    };
  }

  const supabase = crearClientePublico();
  const { data: fila, error } = await supabase
    .from("negocios")
    .select(COLUMNAS_NEGOCIO)
    .eq("slug", slug)
    .eq("estado", "aprobado")
    .maybeSingle<FilaNegocio>();
  if (error) throw error;
  if (!fila) return null;

  const { data: productos, error: errorProductos } = await supabase
    .from("productos")
    .select("id, negocio_id, nombre, descripcion, precio, imagen_url, seccion")
    .eq("negocio_id", fila.id)
    .eq("disponible", true)
    .order("orden")
    .order("nombre")
    .returns<FilaProducto[]>();
  if (errorProductos) throw errorProductos;

  return { negocio: aNegocio(fila), productos: productos.map(aProducto) };
}

export type ResultadoBusqueda = {
  negocio: Negocio;
  coincidencias: Producto[]; // productos que coinciden con el texto buscado
};

export async function buscar(texto: string, categoria?: string): Promise<ResultadoBusqueda[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_NEGOCIOS);

  const q = normalizar(texto);
  const negocios = (await obtenerNegocios()).filter(
    (n) => !categoria || n.categoria === categoria,
  );
  if (!q) return negocios.map((negocio) => ({ negocio, coincidencias: [] }));

  let productos: Producto[];
  if (modoDemo) {
    productos = PRODUCTOS_DEMO;
  } else {
    // RLS ya limita a productos disponibles de negocios aprobados.
    const { data, error } = await crearClientePublico()
      .from("productos")
      .select("id, negocio_id, nombre, descripcion, precio, imagen_url, seccion")
      .eq("disponible", true)
      .ilike("nombre", `%${texto.trim().replace(/[%_,()]/g, " ")}%`)
      .limit(200)
      .returns<FilaProducto[]>();
    if (error) throw error;
    productos = data.map(aProducto);
  }

  const resultados: ResultadoBusqueda[] = [];
  for (const negocio of negocios) {
    const coincidencias = productos.filter(
      (p) => p.negocioId === negocio.id && normalizar(p.nombre).includes(q),
    );
    const enNegocio =
      normalizar(negocio.nombre).includes(q) ||
      normalizar(negocio.descripcion ?? "").includes(q) ||
      normalizar(buscarCategoria(negocio.categoria)?.nombre ?? "").includes(q);
    if (enNegocio || coincidencias.length > 0) {
      resultados.push({ negocio, coincidencias: coincidencias.slice(0, 3) });
    }
  }
  return resultados;
}
