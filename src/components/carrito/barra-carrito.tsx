"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dinero } from "@/lib/formato";
import { useCarrito } from "./proveedor";

// Botón flotante del pedido en celular. En escritorio vive en el encabezado.
export function BarraCarrito() {
  const { carrito, piezas, subtotal } = useCarrito();
  const ruta = usePathname();

  if (piezas === 0 || ruta.startsWith("/carrito")) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-3 pb-3 md:hidden">
      <Link
        href="/carrito"
        className="flex h-14 items-center gap-3 rounded-full bg-foreground pl-2 pr-5 text-white shadow-flotante"
      >
        <span
          key={piezas}
          className="salto grid size-10 place-items-center rounded-full bg-dorado-400 font-display text-base font-bold text-foreground"
        >
          {piezas}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[15px] font-semibold">Ver mi pedido</span>
          <span className="block truncate text-xs text-white/70">{carrito.negocio?.nombre}</span>
        </span>
        <span className="font-display text-lg font-bold">{dinero(subtotal)}</span>
      </Link>
    </div>
  );
}
