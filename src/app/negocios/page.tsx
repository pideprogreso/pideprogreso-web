import type { Metadata } from "next";
import { Suspense } from "react";
import { AvisoDemo } from "@/components/aviso-demo";
import { Buscador } from "@/components/buscador";
import { CarruselCategorias } from "@/components/carrusel-categorias";
import { TarjetaNegocio } from "@/components/tarjeta-negocio";
import { buscarCategoria } from "@/lib/categorias";
import { buscar } from "@/lib/datos";
import { dinero } from "@/lib/formato";

export const metadata: Metadata = { title: "Buscar" };

type Filtros = { q?: string | string[]; categoria?: string | string[] };

export default function PaginaNegocios({ searchParams }: PageProps<"/negocios">) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-vino-700 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:rounded-b-3xl md:px-8">
        <Suspense fallback={<Buscador />}>
          <BuscadorConValor searchParams={searchParams} />
        </Suspense>
      </header>
      <Suspense fallback={<Cargando />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function texto(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.slice(0, 80) ?? "";
}

async function BuscadorConValor({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const categoria = texto(f.categoria) || undefined;
  return <Buscador valor={texto(f.q)} categoria={categoria} />;
}

async function Resultados({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const q = texto(f.q);
  const categoria = buscarCategoria(texto(f.categoria));
  const resultados = await buscar(q, categoria?.slug);

  const titulo = q
    ? `Resultados para “${q}”${categoria ? ` en ${categoria.nombre}` : ""}`
    : categoria
      ? categoria.nombre
      : "Todos los negocios";

  return (
    <div className="md:px-8">
      <section aria-label="Categorías" className="mt-4 px-4 md:px-0">
        <CarruselCategorias activa={categoria?.slug} />
      </section>
      <AvisoDemo />
      <section className="mt-6 px-4 md:px-0">
        <h1 className="font-display text-2xl font-bold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-suave">
          {resultados.length === 1 ? "1 negocio" : `${resultados.length} negocios`}
        </p>

        {resultados.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-5xl" aria-hidden>
              🔍
            </p>
            <p className="mt-3 font-semibold">No encontramos “{q}”</p>
            <p className="mt-1 text-sm text-suave">
              Prueba con otra palabra, como “tacos”, “pan” o “pizza”.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-6 md:grid-cols-3">
            {resultados.map(({ negocio, coincidencias }) => (
              <li key={negocio.id}>
                <TarjetaNegocio negocio={negocio}>
                  {coincidencias.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {coincidencias.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-full bg-superficie px-2.5 py-1 text-xs"
                        >
                          {p.nombre} <span className="font-semibold">{dinero(p.precio)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </TarjetaNegocio>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Cargando() {
  return (
    <div className="mt-4 px-4 md:px-8" aria-busy="true" aria-label="Cargando negocios">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="size-16 shrink-0 animate-pulse rounded-full bg-superficie" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="aspect-[16/9] animate-pulse rounded-2xl bg-superficie" />
        ))}
      </div>
    </div>
  );
}
