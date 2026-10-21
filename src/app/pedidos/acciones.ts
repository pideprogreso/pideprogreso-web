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
  if (d.productos.length === 0) return "Tu pedido está vacío.";
  if (d.productos.some((p) => !UUID.test(p.productoId) || !Number.isInteger(p.cantidad) || p.cantidad < 1 || p.cantidad > 99))
    return "Revisa las cantidades de tu pedido.";
  return null;
}

// Crea el pedido. Si la persona no tiene sesión, se le abre una sesión anónima
// para que el pedido quede ligado a este dispositivo y pueda seguirlo.
export async function confirmarPedido(datos: DatosPedido): Promise<Resultado> {
  if (!supabaseConfigurado) {
    return { ok: false, error: "Los pedidos de ejemplo no se pueden enviar. Conecta Supabase." };
  }
  const error = validar(datos);
  if (error) return { ok: false, error };

  const supabase = await crearClienteServidor();
  const { data: sesion } = await supabase.auth.getClaims();
  if (!sesion?.claims) {
    const { error: errorSesion } = await supabase.auth.signInAnonymously();
    if (errorSesion) {
      console.error("signInAnonymously", errorSesion);
      return { ok: false, error: "No pudimos registrar tu pedido. Intenta de nuevo en un momento." };
    }
  }

  const { data, error: errorPedido } = await supabase.rpc("crear_pedido", {
    p_negocio_id: datos.negocioId,
    p_modalidad: datos.modalidad,
    p_metodo_pago: datos.metodoPago,
    p_nombre_contacto: datos.nombre.trim().slice(0, 120),
    p_telefono_contacto: datos.telefono.replace(/\D/g, ""),
    p_productos: datos.productos.map((p) => ({ producto_id: p.productoId, cantidad: p.cantidad })),
    p_direccion_entrega: datos.modalidad === "entrega" ? datos.direccion.trim().slice(0, 300) : null,
    p_notas: datos.notas.trim().slice(0, 500) || null,
  });

  if (errorPedido) {
    // Los mensajes de crear_pedido están escritos para el cliente (P0001 = raise exception).
    if (errorPedido.code === "P0001") return { ok: false, error: errorPedido.message };
    console.error("crear_pedido", errorPedido);
    return { ok: false, error: "No pudimos enviar tu pedido. Intenta de nuevo en un momento." };
  }
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
