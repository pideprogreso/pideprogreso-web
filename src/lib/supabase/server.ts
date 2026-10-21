import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { requerirConfig } from "./config";

// Cliente para Server Components, Server Actions y Route Handlers.
// Lee cookies, así que el componente que lo use debe ir dentro de <Suspense>.
export async function crearClienteServidor() {
  const { url, key } = requerirConfig();
  // supabase-js lee la hora al iniciar la sesión: marca la petición como dinámica
  // para que Next no intente prerenderizarla (aviso "unstable value Date.now()").
  await connection();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component: el proxy renueva la sesión.
        }
      },
    },
  });
}
