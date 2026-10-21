import "server-only";
import { cache } from "react";
import { supabaseConfigurado } from "./supabase/config";
import { crearClienteServidor } from "./supabase/server";

export type Usuario = {
  id: string;
  email: string | null;
  nombre: string;
  // Los clientes que piden sin cuenta tienen sesión anónima.
  anonimo: boolean;
};

// Lee la sesión una vez por petición. Debe usarse dentro de <Suspense>.
export const obtenerUsuario = cache(async (): Promise<Usuario | null> => {
  if (!supabaseConfigurado) return null;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const c = data?.claims;
  if (!c?.sub) return null;
  // Con Google el nombre llega como full_name o name.
  const meta = (c.user_metadata ?? {}) as { nombre?: string; full_name?: string; name?: string };
  return {
    id: c.sub,
    email: c.email ?? null,
    nombre: meta.nombre || meta.full_name || meta.name || "",
    anonimo: Boolean(c.is_anonymous),
  };
});

// Solo permite volver a rutas internas.
export function destinoSeguro(valor: unknown, porDefecto = "/cuenta") {
  return typeof valor === "string" && valor.startsWith("/") && !valor.startsWith("//")
    ? valor
    : porDefecto;
}
