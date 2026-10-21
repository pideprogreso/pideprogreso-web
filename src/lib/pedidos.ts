import "server-only";
import type { EstadoPedido, MetodoPago, Modalidad } from "./estados";
import { supabaseConfigurado } from "./supabase/config";
import { crearClienteServidor } from "./supabase/server";

// La DB solo los da al dueño, a un admin o a quien ya le pidió a ese negocio.
export async function obtenerDatosTransferencia(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  negocioId: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("datos_transferencia", { p_negocio_id: negocioId });
  if (error) throw error;
  return typeof data === "string" ? data : null;
}

export type Pedido = {
  id: string;
  folio: number;
  estado: EstadoPedido;
  modalidad: Modalidad;
  metodoPago: MetodoPago;
  nombreContacto: string;
  telefonoContacto: string;
  direccionEntrega: string | null;
  referencias: string | null;
  ubicacion: { lat: number; lng: number } | null;
  notas: string | null;
  subtotal: number;
  costoEnvio: number;
  total: number;
  creadoEn: string;
  motivoCancelacion: "sin_respuesta" | null;
  negocio: {
    slug: string;
    nombre: string;
    telefono: string | null;
    whatsapp: string | null;
    datosTransferencia: string | null;
    portadaUrl: string | null;
  };
  lineas: { nombre: string; precio: number; cantidad: number; importe: number }[];
};

export type FilaPedido = {
  id: string;
  folio: number;
  estado: EstadoPedido;
  modalidad: Modalidad;
  metodo_pago: MetodoPago;
  nombre_contacto: string;
  telefono_contacto: string;
  direccion_entrega: string | null;
  referencias: string | null;
  lat: number | null;
  lng: number | null;
  notas: string | null;
  subtotal: string | number;
  costo_envio: string | number;
  total: string | number;
  creado_en: string;
  motivo_cancelacion: "sin_respuesta" | null;
  negocios: {
    id: string;
    slug: string;
    nombre: string;
    telefono: string | null;
    whatsapp: string | null;
    portada_url: string | null;
  } | null;
  pedido_detalle: {
    nombre_producto: string;
    precio_unitario: string | number;
    cantidad: number;
    importe: string | number;
  }[];
};

export const COLUMNAS_PEDIDO =
  "id, folio, estado, modalidad, metodo_pago, nombre_contacto, telefono_contacto, direccion_entrega, referencias, lat, lng, notas, subtotal, costo_envio, total, creado_en, motivo_cancelacion, negocios(id, slug, nombre, telefono, whatsapp, portada_url), pedido_detalle(nombre_producto, precio_unitario, cantidad, importe)";

export function aPedido(f: FilaPedido): Pedido {
  return {
    id: f.id,
    folio: f.folio,
    estado: f.estado,
    modalidad: f.modalidad,
    metodoPago: f.metodo_pago,
    nombreContacto: f.nombre_contacto,
    telefonoContacto: f.telefono_contacto,
    direccionEntrega: f.direccion_entrega,
    referencias: f.referencias,
    ubicacion: f.lat !== null && f.lng !== null ? { lat: f.lat, lng: f.lng } : null,
    notas: f.notas,
    subtotal: Number(f.subtotal),
    costoEnvio: Number(f.costo_envio),
    total: Number(f.total),
    creadoEn: f.creado_en,
    motivoCancelacion: f.motivo_cancelacion,
    negocio: {
      slug: f.negocios?.slug ?? "",
      nombre: f.negocios?.nombre ?? "Negocio",
      telefono: f.negocios?.telefono ?? null,
      whatsapp: f.negocios?.whatsapp ?? null,
      datosTransferencia: null,
      portadaUrl: f.negocios?.portada_url ?? null,
    },
    lineas: f.pedido_detalle.map((d) => ({
      nombre: d.nombre_producto,
      precio: Number(d.precio_unitario),
      cantidad: d.cantidad,
      importe: Number(d.importe),
    })),
  };
}

// RLS limita a los pedidos de quien tiene la sesión (o de su negocio).
export async function obtenerPedido(id: string): Promise<Pedido | null> {
  if (!supabaseConfigurado || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUMNAS_PEDIDO)
    .eq("id", id)
    .maybeSingle<FilaPedido>();
  if (error) throw error;
  if (!data) return null;
  const pedido = aPedido(data);
  if (pedido.metodoPago === "transferencia" && data.negocios) {
    pedido.negocio.datosTransferencia = await obtenerDatosTransferencia(supabase, data.negocios.id);
  }
  return pedido;
}

export async function obtenerMisPedidos(): Promise<Pedido[]> {
  if (!supabaseConfigurado) return [];
  const supabase = await crearClienteServidor();
  const { data: claims } = await supabase.auth.getClaims();
  const usuario = claims?.claims.sub;
  if (!usuario) return [];
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUMNAS_PEDIDO)
    .eq("cliente_id", usuario)
    .order("creado_en", { ascending: false })
    .limit(30)
    .returns<FilaPedido[]>();
  if (error) throw error;
  return data.map(aPedido);
}
