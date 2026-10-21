import { ChevronRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { dinero } from "@/lib/formato";
import { obtenerProductosPanel, requerirNegocio, type ProductoPanel } from "@/lib/panel";
import { InterruptorDisponible } from "./interruptor-disponible";

export const metadata: Metadata = { title: "Menú" };

export default function PaginaMenu() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-superficie" />}>
      <Menu />
    </Suspense>
  );
}

async function Menu() {
  const negocio = await requerirNegocio("/panel/menu");
  const productos = await obtenerProductosPanel(negocio.id);
  const secciones = new Map<string, ProductoPanel[]>();
  for (const p of productos) secciones.set(p.seccion, [...(secciones.get(p.seccion) ?? []), p]);

  return (
    <div className="pt-6 md:pt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Menú</h2>
          <p className="text-sm text-suave">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}. Apaga los que se terminen.
          </p>
        </div>
        <Link
          href="/panel/menu/nuevo"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-vino-700 px-5 font-semibold text-white hover:bg-vino-800"
        >
          <Plus aria-hidden size={20} />
          Agregar
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-superficie px-6 py-12 text-center">
          <p className="font-display text-xl font-bold">Tu menú está vacío</p>
          <p className="mx-auto mt-1 max-w-xs text-suave">
            Agrega tus productos con precio y foto. Los clientes piden más cuando ven la foto.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {[...secciones].map(([seccion, lista]) => (
            <section key={seccion}>
              <h3 className="font-display text-lg font-bold">{seccion}</h3>
              <ul className="mt-2 divide-y divide-borde rounded-2xl border border-borde">
                {lista.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-3 py-3">
                    <Link href={`/panel/menu/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-superficie">
                        {p.imagenUrl && <Image src={p.imagenUrl} alt="" fill sizes="56px" className="object-cover" />}
                      </span>
                      <span className={`min-w-0 flex-1 ${p.disponible ? "" : "opacity-50"}`}>
                        <span className="block truncate font-semibold">{p.nombre}</span>
                        <span className="block text-sm tabular-nums text-suave">
                          {dinero(p.precio)}
                          {!p.disponible && " · Agotado"}
                        </span>
                      </span>
                      <ChevronRight aria-hidden size={18} className="shrink-0 text-suave" />
                    </Link>
                    <InterruptorDisponible id={p.id} disponible={p.disponible} nombre={p.nombre} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
