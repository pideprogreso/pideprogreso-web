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
