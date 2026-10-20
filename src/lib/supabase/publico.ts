import { createClient } from "@supabase/supabase-js";
import { requerirConfig } from "./config";

// Cliente sin sesión para datos públicos (negocios aprobados y sus productos).
// No lee cookies, así que sus consultas se pueden cachear.
export function crearClientePublico() {
  const { url, key } = requerirConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
