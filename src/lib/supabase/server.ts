import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requerirConfig } from "./config";

// Cliente para Server Components, Server Actions y Route Handlers.
// Lee cookies, así que el componente que lo use debe ir dentro de <Suspense>.
export async function crearClienteServidor() {
  const { url, key } = requerirConfig();
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
