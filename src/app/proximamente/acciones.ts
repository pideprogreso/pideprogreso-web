"use server";

import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

export type Resultado = { ok: true } | { ok: false; error: string };

export async function registrarInteresado(datos: {
  nombre: string;
  negocio: string;
  telefono: string;
  correo: string;
  giro: string;
}): Promise<Resultado> {
  const nombre = datos.nombre.trim();
  const negocio = datos.negocio.trim();
  const telefono = datos.telefono.replace(/[^\d+]/g, "");
  const correo = datos.correo.trim().toLowerCase();
  const giro = datos.giro.trim();

  if (nombre.length < 2) return { ok: false, error: "Escribe tu nombre." };
  if (negocio.length < 2) return { ok: false, error: "Escribe el nombre de tu negocio." };
  if (!/^\+?\d{10,15}$/.test(telefono)) return { ok: false, error: "Escribe un teléfono de 10 dígitos." };
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return { ok: false, error: "Revisa tu correo." };
  if (giro.length < 2) return { ok: false, error: "Elige el giro de tu negocio." };
  if (!supabaseConfigurado) return { ok: false, error: "El registro se guarda cuando Supabase está conectado." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("interesados").insert({
    nombre: nombre.slice(0, 120),
    negocio: negocio.slice(0, 120),
    telefono,
    correo: correo.slice(0, 120) || null,
    giro: giro.slice(0, 60),
  });
  if (error) {
    console.error("registrarInteresado", error);
    return { ok: false, error: "No se pudo enviar. Intenta de nuevo en un momento." };
  }
  return { ok: true };
}
