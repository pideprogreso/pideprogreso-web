"use client";

import { Camera, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { dinero, normalizar } from "@/lib/formato";
import type { ProductoPanel } from "@/lib/panel";
import { InterruptorDisponible } from "./interruptor-disponible";

export function ListaMenu({ productos }: { productos: ProductoPanel[] }) {
  const [buscar, setBuscar] = useState("");
  const [seccion, setSeccion] = useState<string | null>(null);
  const nombres = [...new Set(productos.map((p) => p.seccion))];
  const q = normalizar(buscar.trim());
  const visibles = productos.filter(
    (p) => (!seccion || p.seccion === seccion) && (!q || normalizar(p.nombre).includes(q)),
  );
  const secciones = new Map<string, ProductoPanel[]>();
  for (const p of visibles) secciones.set(p.seccion, [...(secciones.get(p.seccion) ?? []), p]);

  return (
    <div className="mt-5 space-y-4">
      <label className="relative block">
        <span className="sr-only">Buscar producto</span>
        <Search aria-hidden size={18} className="pointer-events-none absolute inset-y-0 left-4 my-auto text-suave" />
        <input
          type="search"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar producto"
          className="h-12 w-full rounded-full bg-superficie pl-11 pr-4 text-[15px] placeholder:text-suave focus:outline-none focus:ring-2 focus:ring-foreground"
        />
      </label>
      {nombres.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          {[null, ...nombres].map((s) => (
            <button
              key={s ?? "todo"}
              type="button"
              aria-pressed={seccion === s}
              onClick={() => setSeccion(s)}
              className={`h-10 shrink-0 rounded-full border px-4 text-sm font-semibold ${
                seccion === s ? "border-foreground bg-foreground text-white" : "border-borde hover:bg-superficie"
              }`}
            >
              {s ?? "Todo"}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 && <p className="py-8 text-center text-suave">No hay productos con ese nombre.</p>}
      <div className="space-y-6">
        {[...secciones].map(([nombre, lista]) => (
          <section key={nombre}>
            <h3 className="font-display text-lg font-bold">{nombre}</h3>
            <ul className="mt-2 divide-y divide-borde rounded-2xl border border-borde">
              {lista.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-3">
                  <Link href={`/panel/menu/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-superficie ${
                        p.disponible ? "" : "opacity-50"
                      }`}
                    >
                      {p.imagenUrl ? (
                        <Image src={p.imagenUrl} alt="" fill sizes="56px" className="object-cover" />
                      ) : (
                        <Camera aria-hidden size={20} className="text-suave" />
                      )}
                    </span>
                    <span className={`min-w-0 flex-1 ${p.disponible ? "" : "opacity-50"}`}>
                      <span className="block truncate font-semibold">{p.nombre}</span>
                      <span className="block text-sm tabular-nums text-suave">
                        {dinero(p.precio)}
                        {!p.disponible && " · Agotado"}
                        {p.disponible && !p.imagenUrl && <span className="font-semibold text-dorado-800"> · Falta foto</span>}
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
    </div>
  );
}
