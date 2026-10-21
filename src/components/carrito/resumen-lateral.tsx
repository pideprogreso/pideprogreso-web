"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { dinero } from "@/lib/formato";
import { useCarrito } from "./proveedor";

// Resumen del pedido junto al menú, en escritorio.
export function ResumenLateral({ negocioId }: { negocioId: string }) {
  const { carrito, subtotal, cambiar } = useCarrito();
  const delNegocio = carrito.negocio?.id === negocioId ? carrito.lineas : [];

  if (delNegocio.length === 0) {
    return (
      <div className="rounded-2xl border border-borde p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-superficie">
          <ShoppingBag aria-hidden size={22} />
        </span>
        <p className="mt-3 font-semibold">Tu pedido está vacío</p>
        <p className="mt-1 text-sm text-suave">Toca + en un producto para agregarlo.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-borde p-5">
      <h2 className="font-display text-xl font-bold">Tu pedido</h2>
      <ul className="mt-3 divide-y divide-borde">
        {delNegocio.map((l) => (
          <li key={l.productoId} className="flex items-center gap-3 py-2.5 text-sm">
            <select
              aria-label={`Cantidad de ${l.nombre}`}
              value={l.cantidad}
              onChange={(e) => cambiar(l.productoId, Number(e.target.value))}
              className="h-8 rounded-lg bg-superficie px-1.5 font-semibold"
            >
              <option value={0}>Quitar</option>
              {Array.from({ length: Math.max(10, l.cantidad) }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="min-w-0 flex-1 truncate">{l.nombre}</span>
            <span className="font-semibold tabular-nums">{dinero(l.precio * l.cantidad)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-borde pt-3 font-semibold">
        <span>Subtotal</span>
        <span className="tabular-nums">{dinero(subtotal)}</span>
      </div>
      <Link
        href="/carrito"
        className="mt-4 flex h-12 items-center justify-center rounded-full bg-vino-700 font-semibold text-white hover:bg-vino-800"
      >
        Ir a mi pedido
      </Link>
    </div>
  );
}
