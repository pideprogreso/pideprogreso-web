import "server-only";
import { obtenerUsuario } from "./sesion";
import { crearClienteServidor } from "./supabase/server";

export type Direccion = {
  id: string;
  etiqueta: string;
  direccion: string;
  referencias: string | null;
  lat: number | null;
  lng: number | null;
};

export type DatosCliente = {
  nombre: string;
  telefono: string;
  direcciones: Direccion[];
};

// Datos guardados del cliente para llenar el pedido. null si no tiene cuenta.
export async function obtenerDatosCliente(): Promise<DatosCliente | null> {
  const usuario = await obtenerUsuario();
  if (!usuario || usuario.anonimo) return null;
  const supabase = await crearClienteServidor();
  const [perfil, direcciones] = await Promise.all([
    supabase.from("perfiles").select("nombre, telefono").eq("id", usuario.id).maybeSingle(),
    supabase
      .from("direcciones")
      .select("id, etiqueta, direccion, referencias, lat, lng")
      .order("creado_en", { ascending: false })
      .limit(10)
      .returns<Direccion[]>(),
  ]);
  if (direcciones.error) throw direcciones.error;
  return {
    nombre: perfil.data?.nombre || usuario.nombre,
    telefono: perfil.data?.telefono ?? "",
    direcciones: direcciones.data,
  };
}
