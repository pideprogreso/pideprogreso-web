import { createBrowserClient } from "@supabase/ssr";
import { requerirConfig } from "./config";

// Cliente para componentes de cliente ("use client").
export function crearClienteNavegador() {
  const { url, key } = requerirConfig();
  return createBrowserClient(url, key);
}
