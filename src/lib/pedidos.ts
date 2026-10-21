import "server-only";
import type { EstadoPedido, MetodoPago, Modalidad } from "./estados";
import { supabaseConfigurado } from "./supabase/config";
import { crearClienteServidor } from "./supabase/server";

export type Pedido = {
  id: string;
  folio: number;
  estado: EstadoPedido;
  modalidad: Modalidad;
  metodoPago: MetodoPago;
  nombreContacto: string;
  telefonoContacto: string;
  direccionEntrega: string | null;
  notas: string | null;
  subtotal: number;
  costoEnvio: number;
  total: number;
  creadoEn: string;
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

type Fila = {
  id: string;
  folio: number;
  estado: EstadoPedido;
  modalidad: Modalidad;
  metodo_pago: MetodoPago;
  nombre_contacto: string;
  telefono_contacto: string;
  direccion_entrega: string | null;
  notas: string | null;
  subtotal: string | number;
  costo_envio: string | number;
  total: string | number;
  creado_en: string;
  negocios: {
    slug: string;
    nombre: string;
    telefono: string | null;
    whatsapp: string | null;
    datos_transferencia: string | null;
    portada_url: string | null;
  } | null;
  pedido_detalle: {
    nombre_producto: string;
    precio_unitario: string | number;
    cantidad: number;
    importe: string | number;
  }[];
};

const COLUMNAS =
  "id, folio, estado, modalidad, metodo_pago, nombre_contacto, telefono_contacto, direccion_entrega, notas, subtotal, costo_envio, total, creado_en, negocios(slug, nombre, telefono, whatsapp, datos_transferencia, portada_url), pedido_detalle(nombre_producto, precio_unitario, cantidad, importe)";

function aPedido(f: Fila): Pedido {
  return {
    id: f.id,
    folio: f.folio,
    estado: f.estado,
    modalidad: f.modalidad,
    metodoPago: f.metodo_pago,
    nombreContacto: f.nombre_contacto,
    telefonoContacto: f.telefono_contacto,
    direccionEntrega: f.direccion_entrega,
    notas: f.notas,
    subtotal: Number(f.subtotal),
    costoEnvio: Number(f.costo_envio),
    total: Number(f.total),
    creadoEn: f.creado_en,
    negocio: {
      slug: f.negocios?.slug ?? "",
      nombre: f.negocios?.nombre ?? "Negocio",
      telefono: f.negocios?.telefono ?? null,
      whatsapp: f.negocios?.whatsapp ?? null,
      datosTransferencia: f.negocios?.datos_transferencia ?? null,
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
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle<Fila>();
  if (error) throw error;
  return data ? aPedido(data) : null;
}

export async function obtenerMisPedidos(): Promise<Pedido[]> {
  if (!supabaseConfigurado) return [];
  const supabase = await crearClienteServidor();
  const { data: claims } = await supabase.auth.getClaims();
  const usuario = claims?.claims.sub;
  if (!usuario) return [];
  const { data, error } = await supabase
    .from("pedidos")
    .select(COLUMNAS)
    .eq("cliente_id", usuario)
    .order("creado_en", { ascending: false })
    .limit(30)
    .returns<Fila[]>();
  if (error) throw error;
  return data.map(aPedido);
}
