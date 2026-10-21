import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { destinoSeguro } from "@/lib/sesion";
import { crearClienteServidor } from "@/lib/supabase/server";

// Enlace del correo de confirmación de Supabase.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const destino = destinoSeguro(url.searchParams.get("siguiente"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tipo = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await crearClienteServidor();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && tipo
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })
      : { error: new Error("Falta el código") };

  return NextResponse.redirect(new URL(error ? "/entrar?error=enlace" : destino, url.origin));
}
