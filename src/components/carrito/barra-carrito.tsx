"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dinero } from "@/lib/formato";
import { useCarrito } from "./proveedor";

// Botón flotante que aparece en cuanto hay algo en el pedido.
export function BarraCarrito() {
  const { carrito, piezas, subtotal } = useCarrito();
  const ruta = usePathname();

  if (piezas === 0 || ruta === "/carrito") return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-4 pb-3">
      <Link
        href="/carrito"
        className="mx-auto flex h-14 max-w-xl items-center gap-3 rounded-2xl bg-vino-700 px-4 text-white shadow-[0_10px_30px_-8px_rgba(110,15,46,0.6)] hover:bg-vino-600"
      >
        <span className="relative">
          <ShoppingBag aria-hidden size={22} />
          <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-dorado-400 text-[11px] font-bold text-vino-900">
            {piezas}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className="font-semibold">Ver pedido</span>
          <span className="text-vino-100"> en {carrito.negocio?.nombre}</span>
        </span>
        <span className="font-display text-lg font-bold">{dinero(subtotal)}</span>
      </Link>
    </div>
  );
}
