export type EstadoPedido =
  | "recibido"
  | "aceptado"
  | "en_preparacion"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado"
  | "rechazado";

export type Modalidad = "entrega" | "recoger";
export type MetodoPago = "efectivo" | "transferencia";

export const ESTADOS_FINALES: EstadoPedido[] = ["entregado", "cancelado", "rechazado"];

// Pasos que ve el cliente, en orden. "en_camino" solo aplica a entregas.
export function pasosDe(modalidad: Modalidad): EstadoPedido[] {
  return modalidad === "entrega"
    ? ["recibido", "aceptado", "en_preparacion", "listo", "en_camino", "entregado"]
    : ["recibido", "aceptado", "en_preparacion", "listo", "entregado"];
}

export function textoEstado(estado: EstadoPedido, modalidad: Modalidad) {
  switch (estado) {
    case "recibido":
      return { titulo: "Pedido enviado", detalle: "Esperando a que el negocio lo acepte." };
    case "aceptado":
      return { titulo: "Pedido aceptado", detalle: "El negocio ya tiene tu pedido." };
    case "en_preparacion":
      return { titulo: "Preparando tu pedido", detalle: "Lo están preparando ahora." };
    case "listo":
      return modalidad === "entrega"
        ? { titulo: "Listo para salir", detalle: "En unos minutos sale hacia tu domicilio." }
        : { titulo: "Listo para recoger", detalle: "Ya puedes pasar por tu pedido." };
    case "en_camino":
      return { titulo: "Va en camino", detalle: "Tu pedido va hacia tu domicilio." };
    case "entregado":
      return { titulo: "Entregado", detalle: "¡Buen provecho!" };
    case "cancelado":
      return { titulo: "Pedido cancelado", detalle: "Este pedido se canceló." };
    case "rechazado":
      return {
        titulo: "El negocio no pudo tomar tu pedido",
        detalle: "Puede que se les haya terminado algo. Intenta de nuevo o elige otro negocio.",
      };
  }
}

export function etiquetaCorta(estado: EstadoPedido) {
  return {
    recibido: "Enviado",
    aceptado: "Aceptado",
    en_preparacion: "Preparando",
    listo: "Listo",
    en_camino: "En camino",
    entregado: "Entregado",
    cancelado: "Cancelado",
    rechazado: "No aceptado",
  }[estado];
}
