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

function traducir(mensaje: string) {
  if (/invalid login credentials/i.test(mensaje)) return "El correo o la contraseña no coinciden.";
  if (/email not confirmed/i.test(mensaje)) return "Primero confirma tu correo con el enlace que te enviamos.";
  if (/already registered|already exists/i.test(mensaje)) return "Ya hay una cuenta con ese correo. Entra con tu contraseña.";
  if (/rate limit|too many/i.test(mensaje)) return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
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

  const h = await headers();
  const origen = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
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
