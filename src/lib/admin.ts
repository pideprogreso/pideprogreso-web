import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { aNegocio, COLUMNAS_NEGOCIO, type FilaNegocio } from "./datos";
import type { EstadoPedido } from "./estados";
import type { EstadoNegocio } from "./panel";
import { obtenerUsuario } from "./sesion";
import { crearClienteServidor } from "./supabase/server";
import type { Negocio } from "./tipos";

export type NegocioAdmin = Negocio & {
  estado: EstadoNegocio;
  creadoEn: string;
  dueno: string;
  productos: number;
};

export type PedidoAdmin = {
  id: string;
  folio: number;
  estado: EstadoPedido;
  total: number;
  creadoEn: string;
  cliente: string;
  negocio: string;
};

export const esAdmin = cache(async (): Promise<boolean> => {
  const usuario = await obtenerUsuario();
  if (!usuario || usuario.anonimo) return false;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("perfiles").select("rol").eq("id", usuario.id).maybeSingle();
  return data?.rol === "admin";
});

// El panel de administración no existe para quien no es admin.
export async function requerirAdmin() {
  if (!(await esAdmin())) notFound();
}

export async function obtenerNegociosAdmin(): Promise<NegocioAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("negocios")
    .select(`${COLUMNAS_NEGOCIO}, estado, creado_en, perfiles(nombre), productos(count)`)
    .order("creado_en", { ascending: false })
    .returns<
      (FilaNegocio & {
        estado: EstadoNegocio;
        creado_en: string;
        perfiles: { nombre: string } | null;
        productos: { count: number }[];
      })[]
    >();
  if (error) throw error;
  return data.map((f) => ({
    ...aNegocio(f),
    estado: f.estado,
    creadoEn: f.creado_en,
    dueno: f.perfiles?.nombre || "Sin nombre",
    productos: f.productos[0]?.count ?? 0,
  }));
}

export async function obtenerPedidosAdmin(): Promise<PedidoAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, folio, estado, total, creado_en, nombre_contacto, negocios(nombre)")
    .order("creado_en", { ascending: false })
    .limit(200)
    .returns<
      {
        id: string;
        folio: number;
        estado: EstadoPedido;
        total: number | string;
        creado_en: string;
        nombre_contacto: string;
        negocios: { nombre: string } | null;
      }[]
    >();
  if (error) throw error;
  return data.map((f) => ({
    id: f.id,
    folio: f.folio,
    estado: f.estado,
    total: Number(f.total),
    creadoEn: f.creado_en,
    cliente: f.nombre_contacto,
    negocio: f.negocios?.nombre ?? "",
  }));
}

export type ResumenMes = { pedidos: number; entregado: number; perdidos: number };
export type PagoMes = { monto: number; metodo: "transferencia" | "mercado_pago" | "efectivo" };

// Primer día del mes en curso en Nuevo Progreso, como "2026-10-01".
export const mesActual = () =>
  `${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Matamoros", year: "numeric", month: "2-digit" }).format(new Date())}-01`;

export async function obtenerPagosMes(mes: string): Promise<Map<string, PagoMes>> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("pagos_negocio")
    .select("negocio_id, monto, metodo")
    .eq("mes", mes)
    .returns<{ negocio_id: string; monto: number | string; metodo: PagoMes["metodo"] }[]>();
  if (error) throw error;
  return new Map(data.map((f) => [f.negocio_id, { monto: Number(f.monto), metodo: f.metodo }]));
}

// Pedidos del mes por negocio, para mostrarle a cada negocio lo que recibe por su cuota.
// shortcut: suma en el servidor trayendo los pedidos de 1,000 en 1,000; con decenas de miles al mes, pasar a una vista agregada en Supabase.
export async function obtenerResumenMes(): Promise<Map<string, ResumenMes>> {
  const dia = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Matamoros", day: "numeric" }).format(new Date()));
  const desde = inicioDeHoy(new Date(Date.now() - (dia - 1) * 864e5));
  const supabase = await crearClienteServidor();
  const filas: { negocio_id: string; estado: EstadoPedido; total: number | string }[] = [];
  // Supabase devuelve como máximo 1,000 filas por consulta.
  for (let desdeFila = 0; ; desdeFila += 1000) {
    const { data, error } = await supabase
      .from("pedidos")
      .select("negocio_id, estado, total")
      .gte("creado_en", desde)
      .order("id")
      .range(desdeFila, desdeFila + 999)
      .returns<{ negocio_id: string; estado: EstadoPedido; total: number | string }[]>();
    if (error) throw error;
    filas.push(...data);
    if (data.length < 1000) break;
  }
  const resumen = new Map<string, ResumenMes>();
  for (const f of filas) {
    const r = resumen.get(f.negocio_id) ?? { pedidos: 0, entregado: 0, perdidos: 0 };
    if (f.estado === "cancelado" || f.estado === "rechazado") r.perdidos++;
    else r.pedidos++;
    if (f.estado === "entregado") r.entregado += Number(f.total);
    resumen.set(f.negocio_id, r);
  }
  return resumen;
}

// Inicio del día en Nuevo Progreso (America/Matamoros), en ISO.
export function inicioDeHoy(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Matamoros",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
  }).formatToParts(ahora);
  const v = (t: string) => Number(partes.find((p) => p.type === t)!.value);
  const transcurrido = (v("hour") * 60 + v("minute")) * 60000 + ahora.getSeconds() * 1000 + ahora.getMilliseconds();
  return new Date(ahora.getTime() - transcurrido).toISOString();
}

export type Reporte = {
  id: string;
  pagina: string;
  texto: string;
  contacto: string | null;
  navegador: string | null;
  resuelto: boolean;
  creadoEn: string;
  usuario: string | null;
};

export async function obtenerReportes(): Promise<Reporte[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("reportes")
    .select("id, pagina, texto, contacto, navegador, resuelto, creado_en, perfiles(nombre)")
    .order("resuelto")
    .order("creado_en", { ascending: false })
    .limit(100)
    .returns<
      {
        id: string;
        pagina: string;
        texto: string;
        contacto: string | null;
        navegador: string | null;
        resuelto: boolean;
        creado_en: string;
        perfiles: { nombre: string } | null;
      }[]
    >();
  if (error) throw error;
  return data.map((f) => ({
    id: f.id,
    pagina: f.pagina,
    texto: f.texto,
    contacto: f.contacto,
    navegador: f.navegador,
    resuelto: f.resuelto,
    creadoEn: f.creado_en,
    usuario: f.perfiles?.nombre || null,
  }));
}
