import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

// Renueva la sesión de Supabase en cada petición.
export async function proxy(request: NextRequest) {
  // En el dominio de lanzamiento (variable DOMINIO_PROXIMAMENTE en Netlify) solo existe la página de próximamente.
  const dominio = process.env.DOMINIO_PROXIMAMENTE?.replace(/^www\./, "");
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(":")[0];
  if (dominio && host.replace(/^www\./, "") === dominio) {
    return NextResponse.rewrite(new URL("/proximamente", request.url));
  }

  let response = NextResponse.next({ request });

  // Sin credenciales (desarrollo inicial) la app funciona sin sesión.
  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
      },
    },
  });

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
