"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { destinoSeguro } from "@/lib/sesion";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

export type ResultadoAcceso =
  | { ok: true; destino: string }
  | { ok: true; confirmar: true; email: string }
  | { ok: false; error: string };

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function origenActual() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

function traducir(mensaje: string) {
  if (/invalid login credentials/i.test(mensaje)) return "El correo o la contraseña no coinciden.";
  if (/email not confirmed/i.test(mensaje)) return "Primero confirma tu correo con el enlace que te enviamos.";
  if (/already registered|already exists/i.test(mensaje)) return "Ya hay una cuenta con ese correo. Entra con tu contraseña.";
  if (/rate limit|too many/i.test(mensaje)) return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
  if (/same.*password|different from the old/i.test(mensaje)) return "La nueva contraseña debe ser distinta a la anterior.";
  if (/password/i.test(mensaje)) return "La contraseña debe tener al menos 8 caracteres.";
  return "No pudimos completar el acceso. Intenta de nuevo.";
}

export async function entrar(email: string, password: string, siguiente: string): Promise<ResultadoAcceso> {
  if (!supabaseConfigurado) return { ok: false, error: "Conecta Supabase para poder entrar." };
  if (!CORREO.test(email.trim())) return { ok: false, error: "Escribe un correo válido." };
  if (!password) return { ok: false, error: "Escribe tu contraseña." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, error: traducir(error.message) };
  return { ok: true, destino: destinoSeguro(siguiente) };
}

export async function crearCuenta(
  nombre: string,
  email: string,
  password: string,
  siguiente: string,
): Promise<ResultadoAcceso> {
  if (!supabaseConfigurado) return { ok: false, error: "Conecta Supabase para poder crear cuentas." };
  if (nombre.trim().length < 2) return { ok: false, error: "Escribe tu nombre." };
  if (!CORREO.test(email.trim())) return { ok: false, error: "Escribe un correo válido." };
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };

  const origen = await origenActual();
  const destino = destinoSeguro(siguiente);

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { nombre: nombre.trim().slice(0, 120) },
      emailRedirectTo: `${origen}/auth/confirmar?siguiente=${encodeURIComponent(destino)}`,
    },
  });
  if (error) return { ok: false, error: traducir(error.message) };
  // Supabase no avisa si el correo ya existe: devuelve un usuario sin identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, error: "Ya hay una cuenta con ese correo. Entra con tu contraseña." };
  }
  if (!data.session) return { ok: true, confirmar: true, email: email.trim() };
  return { ok: true, destino };
}

export async function salir() {
  if (supabaseConfigurado) {
    const supabase = await crearClienteServidor();
    await supabase.auth.signOut();
  }
  redirect("/");
}

// Manda el correo para poner una contraseña nueva. Siempre responde igual,
// para no revelar qué correos tienen cuenta.
export async function enviarRecuperacion(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabaseConfigurado) return { ok: false, error: "Conecta Supabase para recuperar contraseñas." };
  if (!CORREO.test(email.trim())) return { ok: false, error: "Escribe un correo válido." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${await origenActual()}/auth/confirmar?siguiente=/entrar/nueva`,
  });
  if (error && /rate limit|too many/i.test(error.message)) return { ok: false, error: traducir(error.message) };
  if (error) console.error("resetPasswordForEmail", error);
  return { ok: true };
}

export async function cambiarPassword(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims || data.claims.is_anonymous) {
    return { ok: false, error: "El enlace venció. Pide otro correo para cambiar tu contraseña." };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: traducir(error.message) };
  return { ok: true };
}
