"use server";

import { updateTag } from "next/cache";
import { esAdmin } from "@/lib/admin";
import { TAG_NEGOCIOS } from "@/lib/datos";
import type { EstadoNegocio } from "@/lib/panel";
import { crearClienteServidor } from "@/lib/supabase/server";

export type Resultado = { ok: true } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ESTADOS: EstadoNegocio[] = ["pendiente", "aprobado", "suspendido"];

// Al aprobar, el trigger asignar_rol_negocio le da al dueño el rol "negocio".
export async function cambiarEstadoNegocio(id: string, estado: EstadoNegocio): Promise<Resultado> {
  if (!UUID.test(id) || !ESTADOS.includes(estado)) return { ok: false, error: "Acción no válida." };
  if (!(await esAdmin())) return { ok: false, error: "Solo un administrador puede hacer esto." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("negocios").update({ estado }).eq("id", id);
  if (error) {
    console.error("cambiarEstadoNegocio", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}

export async function marcarReporte(id: string, resuelto: boolean): Promise<Resultado> {
  if (!UUID.test(id)) return { ok: false, error: "Reporte no válido." };
  if (!(await esAdmin())) return { ok: false, error: "Solo un administrador puede hacer esto." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("reportes").update({ resuelto: Boolean(resuelto) }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  return { ok: true };
}

// Destaca el negocio en el inicio por 7 días; 0 = quitarlo.
export async function destacarNegocio(id: string, dias: number): Promise<Resultado> {
  if (!UUID.test(id) || ![0, 7].includes(dias)) return { ok: false, error: "Acción no válida." };
  if (!(await esAdmin())) return { ok: false, error: "Solo un administrador puede hacer esto." };
  const hasta = dias ? new Date(Date.now() + dias * 864e5).toISOString() : null;
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("negocios").update({ destacado_hasta: hasta }).eq("id", id);
  if (error) {
    console.error("destacarNegocio", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
  updateTag(TAG_NEGOCIOS);
  return { ok: true };
}

const METODOS = ["transferencia", "mercado_pago", "efectivo"] as const;

// Registra la cuota del mes en curso de un negocio.
export async function registrarPago(negocioId: string, mes: string, monto: number, metodo: string): Promise<Resultado> {
  if (!UUID.test(negocioId) || !/^\d{4}-\d{2}-01$/.test(mes)) return { ok: false, error: "Acción no válida." };
  if (!Number.isFinite(monto) || monto <= 0 || monto > 100000) return { ok: false, error: "Escribe el monto." };
  if (!METODOS.includes(metodo as (typeof METODOS)[number])) return { ok: false, error: "Elige cómo pagó." };
  if (!(await esAdmin())) return { ok: false, error: "Solo un administrador puede hacer esto." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase
    .from("pagos_negocio")
    .insert({ negocio_id: negocioId, mes, monto: Math.round(monto * 100) / 100, metodo });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese mes ya está pagado." };
    console.error("registrarPago", error);
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
  return { ok: true };
}
