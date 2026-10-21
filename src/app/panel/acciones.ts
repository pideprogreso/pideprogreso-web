"use server";

import { updateTag } from "next/cache";
import { CATEGORIAS } from "@/lib/categorias";
import { TAG_NEGOCIOS } from "@/lib/datos";
import type { EstadoPedido } from "@/lib/estados";
import { normalizar } from "@/lib/formato";
import { obtenerMiNegocio } from "@/lib/panel";
import { obtenerUsuario } from "@/lib/sesion";
import { supabaseUrl } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

export type Resultado = { ok: true } | { ok: false; error: string };

export type DatosNegocio = {
  nombre: string;
  categoria: string;
  descripcion: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  horario: string;
  aceptaEntrega: boolean;
  aceptaRecoger: boolean;
  costoEnvio: number;
  pedidoMinimo: number;
  tiempoMin: number;
  tiempoMax: number;
  datosTransferencia: string;
  portadaUrl: string | null;
  logoUrl: string | null;
};

export type DatosProducto = {
  id: string | null;
  nombre: string;
  descripcion: string;
  precio: number;
  seccion: string;
  imagenUrl: string | null;
  disponible: boolean;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ESTADOS: EstadoPedido[] = ["aceptado", "rechazado", "en_preparacion", "listo", "en_camino", "entregado", "cancelado"];
const FALLA = "No se pudo guardar. Revisa tu conexión e intenta de nuevo.";

const digitos = (t: string) => t.replace(/\D/g, "");
const texto = (t: string, max: number) => t.trim().slice(0, max) || null;
const esDinero = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100000;

// Solo se aceptan fotos subidas al bucket del propio negocio.
function fotoValida(url: string | null, negocioId: string | null) {
  if (!url) return true;
  if (!negocioId) return false;
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/fotos/${negocioId}/`);
}

function validarNegocio(d: DatosNegocio, negocioId: string | null): string | null {
  if (d.nombre.trim().length < 2) return "Escribe el nombre del negocio.";
  if (!CATEGORIAS.some((c) => c.slug === d.categoria)) return "Elige una categoría.";
  if (digitos(d.telefono).length !== 10) return "Escribe el teléfono a 10 dígitos.";
  if (d.whatsapp && digitos(d.whatsapp).length !== 10) return "Escribe el WhatsApp a 10 dígitos o déjalo vacío.";
  if (d.direccion.trim().length < 5) return "Escribe la dirección del negocio.";
  if (!d.aceptaEntrega && !d.aceptaRecoger) return "Elige al menos una forma de entrega.";
  if (!esDinero(d.costoEnvio) || !esDinero(d.pedidoMinimo)) return "Revisa el costo de envío y el pedido mínimo.";
  if (!Number.isInteger(d.tiempoMin) || !Number.isInteger(d.tiempoMax) || d.tiempoMin < 5 || d.tiempoMax > 240 || d.tiempoMin > d.tiempoMax)
    return "Revisa el tiempo de entrega (de 5 a 240 minutos).";
  if (!fotoValida(d.portadaUrl, negocioId) || !fotoValida(d.logoUrl, negocioId)) return "Vuelve a subir las fotos.";
  return null;
}

async function filaNegocio(d: DatosNegocio) {
  const supabase = await crearClienteServidor();
  const { data: categoria } = await supabase.from("categorias").select("id").eq("slug", d.categoria).maybeSingle();
  return {
    nombre: d.nombre.trim().slice(0, 120),
    categoria_id: categoria?.id ?? null,
    descripcion: texto(d.descripcion, 1000),
    telefono: digitos(d.telefono),
    whatsapp: digitos(d.whatsapp) || null,
    direccion: texto(d.direccion, 300),
    horario: texto(d.horario, 300),
    acepta_entrega: d.aceptaEntrega,
    acepta_recoger: d.aceptaRecoger,
    costo_envio: d.aceptaEntrega ? d.costoEnvio : 0,
    pedido_minimo: d.pedidoMinimo,
    tiempo_entrega_min: d.tiempoMin,
    tiempo_entrega_max: d.tiempoMax,
    datos_transferencia: texto(d.datosTransferencia, 300),
    portada_url: d.portadaUrl,
    logo_url: d.logoUrl,
  };
}

function slugDe(nombre: string) {
  return (
    normalizar(nombre)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "negocio"
  );
}

export async function registrarNegocio(d: DatosNegocio): Promise<Resultado> {
  const usuario = await obtenerUsuario();
  if (!usuario || usuario.anonimo) return { ok: false, error: "Entra a tu cuenta para registrar tu negocio." };
  if (await obtenerMiNegocio()) return { ok: false, error: "Ya tienes un negocio registrado." };
  const error = validarNegocio({ ...d, portadaUrl: null, logoUrl: null }, null);
  if (error) return { ok: false, error };

  const supabase = await crearClienteServidor();
  const fila = { ...(await filaNegocio({ ...d, portadaUrl: null, logoUrl: null })), propietario_id: usuario.id };
  const base = slugDe(d.nombre);
  // El slug es único; si ya existe se agrega un sufijo.
  for (const slug of [base, `${base}-${crypto.randomUUID().slice(0, 4)}`, `${base}-${crypto.randomUUID().slice(0, 6)}`]) {
    const { error: e } = await supabase.from("negocios").insert({ ...fila, slug });
    if (!e) return { ok: true };
    if (e.code !== "23505") {
      console.error("registrarNegocio", e);
      return { ok: false, error: FALLA };
    }
  }
  return { ok: false, error: FALLA };
}

export async function guardarNegocio(d: DatosNegocio): Promise<Resultado> {
  const negocio = await obtenerMiNegocio();
  if (!negocio) return { ok: false, error: "No encontramos tu negocio." };
  const error = validarNegocio(d, negocio.id);
  if (error) return { ok: false, error };

  const supabase = await crearClienteServidor();
  const { error: e } = await supabase.from("negocios").update(await filaNegocio(d)).eq("id", negocio.id);
  if (e) {
    console.error("guardarNegocio", e);
    return { ok: false, error: FALLA };
  }
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}

// Pausa los pedidos unos minutos sin cerrar el negocio; 0 = reanudar.
export async function pausarPedidos(minutos: number): Promise<Resultado> {
  if (![0, 15, 30].includes(minutos)) return { ok: false, error: "Pausa no válida." };
  const negocio = await obtenerMiNegocio();
  if (!negocio) return { ok: false, error: "No encontramos tu negocio." };
  const hasta = minutos ? new Date(Date.now() + minutos * 60000).toISOString() : null;
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("negocios").update({ pausado_hasta: hasta }).eq("id", negocio.id);
  if (error) return { ok: false, error: FALLA };
  return { ok: true };
}

export async function cambiarAbierto(abierto: boolean): Promise<Resultado> {
  const negocio = await obtenerMiNegocio();
  if (!negocio) return { ok: false, error: "No encontramos tu negocio." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("negocios").update({ abierto: Boolean(abierto) }).eq("id", negocio.id);
  if (error) return { ok: false, error: FALLA };
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}

export async function cambiarEstado(pedidoId: string, estado: EstadoPedido): Promise<Resultado> {
  if (!UUID.test(pedidoId) || !ESTADOS.includes(estado)) return { ok: false, error: "Acción no válida." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cambiar_estado_pedido", { p_pedido_id: pedidoId, p_estado: estado });
  if (error) {
    // P0001: el pedido ya cambió (por ejemplo, el cliente lo canceló).
    if (error.code !== "P0001") console.error("cambiarEstado", error);
    return { ok: false, error: "El pedido ya cambió. Actualiza la pantalla." };
  }
  return { ok: true };
}

export async function guardarProducto(d: DatosProducto): Promise<Resultado> {
  const negocio = await obtenerMiNegocio();
  if (!negocio) return { ok: false, error: "No encontramos tu negocio." };
  if (d.id && !UUID.test(d.id)) return { ok: false, error: "Producto no válido." };
  if (d.nombre.trim().length < 2) return { ok: false, error: "Escribe el nombre del producto." };
  if (!esDinero(d.precio) || d.precio === 0) return { ok: false, error: "Escribe el precio." };
  if (!fotoValida(d.imagenUrl, negocio.id)) return { ok: false, error: "Vuelve a subir la foto." };

  const fila = {
    nombre: d.nombre.trim().slice(0, 120),
    descripcion: texto(d.descripcion, 500),
    precio: Math.round(d.precio * 100) / 100,
    seccion: d.seccion.trim().slice(0, 60) || "Menú",
    imagen_url: d.imagenUrl,
    disponible: Boolean(d.disponible),
  };
  const supabase = await crearClienteServidor();
  const { error } = d.id
    ? await supabase.from("productos").update(fila).eq("id", d.id).eq("negocio_id", negocio.id)
    : await supabase.from("productos").insert({ ...fila, negocio_id: negocio.id });
  if (error) {
    console.error("guardarProducto", error);
    return { ok: false, error: FALLA };
  }
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}

export async function cambiarDisponible(id: string, disponible: boolean): Promise<Resultado> {
  const negocio = await obtenerMiNegocio();
  if (!negocio || !UUID.test(id)) return { ok: false, error: "Producto no válido." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("productos")
    .update({ disponible: Boolean(disponible) })
    .eq("id", id)
    .eq("negocio_id", negocio.id);
  if (error) return { ok: false, error: FALLA };
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}

export async function borrarProducto(id: string): Promise<Resultado> {
  const negocio = await obtenerMiNegocio();
  if (!negocio || !UUID.test(id)) return { ok: false, error: "Producto no válido." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("productos").delete().eq("id", id).eq("negocio_id", negocio.id);
  if (error) return { ok: false, error: FALLA };
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}
