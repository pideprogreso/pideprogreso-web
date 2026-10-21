"use server";

import { headers } from "next/headers";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

export type Resultado = { ok: true } | { ok: false; error: string };

export async function enviarReporte(datos: { pagina: string; texto: string; contacto: string }): Promise<Resultado> {
  const texto = datos.texto.trim();
  if (texto.length < 5) return { ok: false, error: "Cuéntanos un poco más de lo que pasó." };
  if (!supabaseConfigurado) return { ok: false, error: "Los reportes se guardan cuando Supabase está conectado." };

  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const { error } = await supabase.from("reportes").insert({
    usuario_id: data?.claims.sub ?? null,
    pagina: (datos.pagina.startsWith("/") ? datos.pagina : "/").slice(0, 300),
    texto: texto.slice(0, 2000),
    contacto: datos.contacto.trim().slice(0, 120) || null,
    navegador: (await headers()).get("user-agent")?.slice(0, 300) ?? null,
  });
  if (error) {
    console.error("enviarReporte", error);
    return { ok: false, error: "No se pudo enviar. Intenta de nuevo en un momento." };
  }
  return { ok: true };
}
