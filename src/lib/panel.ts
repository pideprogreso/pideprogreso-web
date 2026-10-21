import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { aNegocio, aProducto, COLUMNAS_NEGOCIO, type FilaNegocio, type FilaProducto } from "./datos";
import { ESTADOS_FINALES } from "./estados";
import { aPedido, COLUMNAS_PEDIDO, obtenerDatosTransferencia, type FilaPedido, type Pedido } from "./pedidos";
import { obtenerUsuario } from "./sesion";
import { crearClienteServidor } from "./supabase/server";
import type { Negocio, Producto } from "./tipos";

export type EstadoNegocio = "pendiente" | "aprobado" | "suspendido";
export type MiNegocio = Negocio & { estado: EstadoNegocio; pausadoHasta: string | null };
export type ProductoPanel = Producto & { disponible: boolean; orden: number };

// El negocio de quien tiene la sesión (uno por cuenta en el MVP).
export const obtenerMiNegocio = cache(async (): Promise<MiNegocio | null> => {
  const usuario = await obtenerUsuario();
  if (!usuario || usuario.anonimo) return null;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("negocios")
    .select(`${COLUMNAS_NEGOCIO}, estado, pausado_hasta`)
    .eq("propietario_id", usuario.id)
    .order("creado_en")
    .limit(1)
    .maybeSingle<FilaNegocio & { estado: EstadoNegocio; pausado_hasta: string | null }>();
  if (error) throw error;
  if (!data) return null;
  // Si falla, mejor error que un formulario vacío que borre los datos al guardar.
  const datosTransferencia = await obtenerDatosTransferencia(supabase, data.id);
  return { ...aNegocio(data), datosTransferencia, estado: data.estado, pausadoHasta: data.pausado_hasta };
});

// Para las páginas del panel: sin cuenta va a entrar; sin negocio, a registrarlo.
export async function requerirNegocio(ruta = "/panel"): Promise<MiNegocio> {
  const usuario = await obtenerUsuario();
  if (!usuario || usuario.anonimo) redirect(`/entrar?siguiente=${encodeURIComponent(ruta)}`);
  const negocio = await obtenerMiNegocio();
  if (!negocio) redirect("/registro-negocio");
  return negocio;
}

// Pedidos en curso y los terminados en las últimas 24 horas.
export async function obtenerPedidosNegocio(negocioId: string): Promise<Pedido[]> {
  const supabase = await crearClienteServidor();
  const enCurso = ["recibido", "aceptado", "en_preparacion", "listo", "en_camino"];
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUMNAS_PEDIDO)
    .eq("negocio_id", negocioId)
    .or(`estado.in.(${enCurso.join(",")}),creado_en.gte.${desde}`)
    .order("creado_en", { ascending: false })
    .limit(100)
    .returns<FilaPedido[]>();
  if (error) throw error;
  return data.map(aPedido);
}

const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Matamoros" });

export function separarPedidos(pedidos: Pedido[]) {
  const ahora = Date.now(); // para "hace X min"
  const hoy = dia.format(ahora);
  const vendidos = pedidos.filter(
    (p) => dia.format(new Date(p.creadoEn)) === hoy && p.estado !== "cancelado" && p.estado !== "rechazado",
  );
  return {
    nuevos: pedidos.filter((p) => p.estado === "recibido").reverse(), // el más antiguo primero
    enCocina: pedidos.filter((p) => p.estado === "aceptado" || p.estado === "en_preparacion").reverse(),
    listos: pedidos.filter((p) => p.estado === "listo" || p.estado === "en_camino").reverse(),
    terminados: pedidos.filter((p) => ESTADOS_FINALES.includes(p.estado)),
    hoy: { pedidos: vendidos.length, total: vendidos.reduce((s, p) => s + p.total, 0) },
    ahora,
  };
}

const COLUMNAS_PRODUCTO = "id, negocio_id, nombre, descripcion, precio, imagen_url, seccion, disponible, orden";
type FilaProductoPanel = FilaProducto & { disponible: boolean; orden: number };

export async function obtenerProductosPanel(negocioId: string): Promise<ProductoPanel[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("productos")
    .select(COLUMNAS_PRODUCTO)
    .eq("negocio_id", negocioId)
    .order("seccion")
    .order("orden")
    .order("nombre")
    .returns<FilaProductoPanel[]>();
  if (error) throw error;
  return data.map((f) => ({ ...aProducto(f), disponible: f.disponible, orden: f.orden }));
}

export async function obtenerProductoPanel(negocioId: string, id: string): Promise<ProductoPanel | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("productos")
    .select(COLUMNAS_PRODUCTO)
    .eq("negocio_id", negocioId)
    .eq("id", id)
    .maybeSingle<FilaProductoPanel>();
  if (error) throw error;
  return data ? { ...aProducto(data), disponible: data.disponible, orden: data.orden } : null;
}
