"use client";

import { Minus, Plus } from "lucide-react";
import { useCarrito, type Carrito } from "./proveedor";

export function BotonAgregar({
  negocio,
  producto,
  deshabilitado = false,
}: {
  negocio: NonNullable<Carrito["negocio"]>;
  producto: { productoId: string; nombre: string; precio: number };
  deshabilitado?: boolean;
}) {
  const { cantidadDe, agregar, cambiar } = useCarrito();
  const cantidad = cantidadDe(producto.productoId);

  if (cantidad === 0) {
    return (
      <button
        type="button"
        disabled={deshabilitado}
        onClick={() => agregar(negocio, producto)}
        aria-label={`Agregar ${producto.nombre}`}
        className="grid size-9 place-items-center rounded-full bg-white text-foreground shadow-[0_2px_8px_rgb(0_0_0/0.18)] transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus aria-hidden size={20} strokeWidth={2.6} />
      </button>
    );
  }

  return (
    <div className="flex h-9 items-center rounded-full bg-foreground text-white shadow-[0_2px_8px_rgb(0_0_0/0.25)]">
      <button
        type="button"
        onClick={() => cambiar(producto.productoId, cantidad - 1)}
        aria-label={`Quitar uno de ${producto.nombre}`}
        className="grid size-9 place-items-center rounded-full hover:bg-white/15"
      >
        <Minus aria-hidden size={16} strokeWidth={2.6} />
      </button>
      <span key={cantidad} className="salto min-w-5 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {cantidad}
      </span>
      <button
        type="button"
        onClick={() => agregar(negocio, producto)}
        aria-label={`Agregar otro ${producto.nombre}`}
        className="grid size-9 place-items-center rounded-full hover:bg-white/15"
      >
        <Plus aria-hidden size={16} strokeWidth={2.6} />
      </button>
    </div>
  );
}
