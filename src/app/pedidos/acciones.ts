"use server";

import type { MetodoPago, Modalidad } from "@/lib/estados";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

export type DatosPedido = {
  negocioId: string;
  modalidad: Modalidad;
  metodoPago: MetodoPago;
  nombre: string;
  telefono: string;
  direccion: string;
  notas: string;
  referencias: string;
  ubicacion: { lat: number; lng: number } | null;
  guardarComo: string | null; // etiqueta para guardar la dirección (Casa, Trabajo…)
  productos: { productoId: string; cantidad: number }[];
};

export type Resultado = { ok: true; id: string } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validar(d: DatosPedido): string | null {
  if (!UUID.test(d.negocioId)) return "Este negocio no está disponible.";
  if (d.modalidad !== "entrega" && d.modalidad !== "recoger") return "Elige entrega o recoger.";
  if (d.metodoPago !== "efectivo" && d.metodoPago !== "transferencia") return "Elige cómo vas a pagar.";
  if (d.nombre.trim().length < 2) return "Escribe tu nombre.";
  if (d.telefono.replace(/\D/g, "").length !== 10) return "Escribe tu celular a 10 dígitos.";
  if (d.modalidad === "entrega" && d.direccion.trim().length < 5)
    return "Escribe la dirección de entrega.";
  if (
    d.ubicacion &&
    !(Math.abs(d.ubicacion.lat) <= 90 && Math.abs(d.ubicacion.lng) <= 180)
  )
    return "La ubicación del mapa no es válida.";
  if (d.productos.length === 0) return "Tu pedido está vacío.";
  if (d.productos.some((p) => !UUID.test(p.productoId) || !Number.isInteger(p.cantidad) || p.cantidad < 1 || p.cantidad > 99))
    return "Revisa las cantidades de tu pedido.";
  return null;
}

// Crea el pedido. Hace falta una cuenta (Google o correo): el negocio necesita
// saber quién pide. El nombre y el celular se guardan en el perfil para la próxima.
export async function confirmarPedido(datos: DatosPedido): Promise<Resultado> {
  if (!supabaseConfigurado) {
    return { ok: false, error: "Los pedidos de ejemplo no se pueden enviar. Conecta Supabase." };
  }
  const error = validar(datos);
  if (error) return { ok: false, error };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getClaims();
  const usuario = sesion?.claims;
  if (!usuario?.sub || usuario.is_anonymous) {
    return { ok: false, error: "Entra a tu cuenta para enviar tu pedido." };
  }
  const entrega = datos.modalidad === "entrega";

  const { data, error: errorPedido } = await supabase.rpc("crear_pedido", {
    p_negocio_id: datos.negocioId,
    p_modalidad: datos.modalidad,
    p_metodo_pago: datos.metodoPago,
    p_nombre_contacto: datos.nombre.trim().slice(0, 120),
    p_telefono_contacto: datos.telefono.replace(/\D/g, ""),
    p_productos: datos.productos.map((p) => ({ producto_id: p.productoId, cantidad: p.cantidad })),
    p_direccion_entrega: datos.modalidad === "entrega" ? datos.direccion.trim().slice(0, 300) : null,
    p_notas: datos.notas.trim().slice(0, 500) || null,
    p_referencias: entrega ? datos.referencias.trim().slice(0, 300) || null : null,
    p_lat: entrega ? (datos.ubicacion?.lat ?? null) : null,
    p_lng: entrega ? (datos.ubicacion?.lng ?? null) : null,
  });

  if (errorPedido) {
    // Los mensajes de crear_pedido están escritos para el cliente (P0001 = raise exception).
    if (errorPedido.code === "P0001") return { ok: false, error: errorPedido.message };
    console.error("crear_pedido", errorPedido);
    return { ok: false, error: "No pudimos enviar tu pedido. Intenta de nuevo en un momento." };
  }

  // Lo siguiente es comodidad: si falla, el pedido ya está hecho.
  const telefono = datos.telefono.replace(/\D/g, "");
  const extras: PromiseLike<{ error: unknown }>[] = [
    supabase.from("perfiles").update({ nombre: datos.nombre.trim().slice(0, 120), telefono }).eq("id", usuario.sub),
  ];
  const etiqueta = datos.guardarComo?.trim().slice(0, 40);
  if (entrega && etiqueta) {
    extras.push(
      supabase.from("direcciones").insert({
        usuario_id: usuario.sub,
        etiqueta,
        direccion: datos.direccion.trim().slice(0, 300),
        referencias: datos.referencias.trim().slice(0, 300) || null,
        lat: datos.ubicacion?.lat ?? null,
        lng: datos.ubicacion?.lng ?? null,
      }),
    );
  }
  for (const r of await Promise.all(extras)) if (r.error) console.error("datos del cliente", r.error);

  return { ok: true, id: data as string };
}

export async function cancelarPedido(id: string): Promise<Resultado> {
  if (!supabaseConfigurado || !UUID.test(id)) return { ok: false, error: "Pedido no encontrado." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("cambiar_estado_pedido", {
    p_pedido_id: id,
    p_estado: "cancelado",
  });
  if (error) {
    if (error.code === "P0001") {
      return { ok: false, error: "El negocio ya aceptó tu pedido. Llámales si necesitas cancelarlo." };
    }
    console.error("cancelar", error);
    return { ok: false, error: "No pudimos cancelar. Intenta de nuevo." };
  }
  return { ok: true, id };
}

export async function borrarDireccion(id: string): Promise<Resultado> {
  if (!supabaseConfigurado || !UUID.test(id)) return { ok: false, error: "Dirección no válida." };
  const supabase = await crearClienteServidor();
  const { error } = await supabase.from("direcciones").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo borrar. Intenta de nuevo." };
  return { ok: true, id };
}
