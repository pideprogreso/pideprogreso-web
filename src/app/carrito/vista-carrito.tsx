"use client";

import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCarrito } from "@/components/carrito/proveedor";
import { dinero } from "@/lib/formato";

export function VistaCarrito() {
  const { carrito, subtotal, cambiar, vaciar } = useCarrito();
  const negocio = carrito.negocio;

  if (!negocio || carrito.lineas.length === 0) {
    return (
      <div className="px-6 pt-20 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-superficie">
          <ShoppingBag aria-hidden size={34} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">Tu pedido está vacío</h1>
        <p className="mt-2 text-suave">Elige un negocio y agrega lo que se te antoje.</p>
        <Link
          href="/negocios"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-foreground px-6 font-semibold text-white hover:bg-vino-700"
        >
          Ver negocios
        </Link>
      </div>
    );
  }

  const faltaMinimo = Math.max(negocio.pedidoMinimo - subtotal, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8">
      <header className="flex items-center gap-3 pt-4 md:pt-10">
        <Link
          href={`/negocios/${negocio.slug}`}
          aria-label={`Volver a ${negocio.nombre}`}
          className="grid size-10 place-items-center rounded-full bg-superficie"
        >
          <ArrowLeft aria-hidden size={20} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">Mi pedido</h1>
          <p className="truncate text-sm text-suave">{negocio.nombre}</p>
        </div>
      </header>

      <ul className="mt-6 divide-y divide-borde">
        {carrito.lineas.map((l) => (
          <li key={l.productoId} className="flex items-center gap-3 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{l.nombre}</p>
              <p className="text-sm text-suave">{dinero(l.precio)} c/u</p>
            </div>
            <div className="flex h-10 items-center rounded-full bg-superficie">
              <button
                type="button"
                onClick={() => cambiar(l.productoId, l.cantidad - 1)}
                aria-label={l.cantidad === 1 ? `Quitar ${l.nombre}` : `Quitar uno de ${l.nombre}`}
                className="grid size-10 place-items-center rounded-full hover:bg-superficie-2"
              >
                {l.cantidad === 1 ? (
                  <Trash2 aria-hidden size={16} />
                ) : (
                  <Minus aria-hidden size={16} />
                )}
              </button>
              <span className="min-w-6 text-center font-bold">{l.cantidad}</span>
              <button
                type="button"
                onClick={() => cambiar(l.productoId, l.cantidad + 1)}
                aria-label={`Agregar otro ${l.nombre}`}
                className="grid size-10 place-items-center rounded-full hover:bg-superficie-2"
              >
                <Plus aria-hidden size={16} />
              </button>
            </div>
            <p className="w-20 text-right font-semibold">{dinero(l.precio * l.cantidad)}</p>
          </li>
        ))}
      </ul>

      <Link
        href={`/negocios/${negocio.slug}`}
        className="mt-2 inline-block text-sm font-semibold text-vino-700"
      >
        Agregar más productos
      </Link>

      <dl className="mt-6 space-y-2 rounded-2xl bg-superficie p-4">
        <div className="flex justify-between">
          <dt>Productos</dt>
          <dd>{dinero(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-suave">
          <dt>Envío</dt>
          <dd>
            {negocio.costoEnvio === 0 ? "Gratis" : dinero(negocio.costoEnvio)}
            <span className="sr-only"> si eliges entrega a domicilio</span>
          </dd>
        </div>
        <div className="flex justify-between border-t border-borde pt-2 font-display text-lg font-bold">
          <dt>Total con envío</dt>
          <dd>{dinero(subtotal + negocio.costoEnvio)}</dd>
        </div>
      </dl>

      {faltaMinimo > 0 && (
        <p className="mt-3 rounded-xl bg-dorado-100 px-4 py-3 text-sm text-dorado-800">
          Agrega {dinero(faltaMinimo)} más para llegar al pedido mínimo de{" "}
          {dinero(negocio.pedidoMinimo)}.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {faltaMinimo > 0 ? (
          <span className="flex h-14 w-full items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white opacity-50">
            Continuar
          </span>
        ) : (
          <Link
            href="/carrito/confirmar"
            className="flex h-14 w-full items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800"
          >
            Continuar
          </Link>
        )}
        <button
          type="button"
          onClick={vaciar}
          className="w-full py-2 text-sm font-semibold text-suave hover:text-foreground"
        >
          Vaciar pedido
        </button>
      </div>
    </div>
  );
}
