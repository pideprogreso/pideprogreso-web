"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCarrito } from "./proveedor";

// Botón del pedido en el encabezado de escritorio.
export function BotonPedido() {
  const { piezas } = useCarrito();
  return (
    <Link
      href="/carrito"
      className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-[15px] font-semibold text-white hover:bg-vino-700"
    >
      <ShoppingBag aria-hidden size={18} />
      <span>Mi pedido</span>
      {piezas > 0 && (
        <span
          key={piezas}
          className="salto grid min-w-6 place-items-center rounded-full bg-dorado-400 px-1.5 text-xs font-bold text-foreground"
        >
          {piezas}
        </span>
      )}
    </Link>
  );
}
