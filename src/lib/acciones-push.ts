"use server";

import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

export type SuscripcionPush = { endpoint: string; keys: { p256dh: string; auth: string } };

// Guarda el celular de quien tiene la sesión abierta para mandarle avisos.
export async function guardarSuscripcion(s: SuscripcionPush): Promise<boolean> {
  if (!supabaseConfigurado) return false;
  const valida =
    typeof s?.endpoint === "string" &&
    s.endpoint.startsWith("https://") &&
    s.endpoint.length <= 1000 &&
    typeof s.keys?.p256dh === "string" &&
    s.keys.p256dh.length <= 200 &&
    typeof s.keys?.auth === "string" &&
    s.keys.auth.length <= 100;
  if (!valida) return false;
  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getClaims();
  const usuario = sesion?.claims?.sub;
  if (!usuario) return false;
  // Si el endpoint era de otra cuenta, la política lo impide y el navegador pide uno nuevo (ver activar-avisos).
  const { error } = await supabase
    .from("suscripciones_push")
    .upsert({ endpoint: s.endpoint, usuario_id: usuario, p256dh: s.keys.p256dh, auth: s.keys.auth });
  if (error) console.error("guardarSuscripcion", error);
  return !error;
}
