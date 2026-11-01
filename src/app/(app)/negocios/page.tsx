import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CarruselCategorias } from "@/components/carrusel-categorias";
import { TarjetaNegocio } from "@/components/tarjeta-negocio";
import { buscarCategoria } from "@/lib/categorias";
import { buscar } from "@/lib/datos";
import { dinero } from "@/lib/formato";

export const metadata: Metadata = { title: "Negocios" };

type Filtros = Record<string, string | string[] | undefined>;

export default function PaginaNegocios({ searchParams }: PageProps<"/negocios">) {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <Suspense fallback={<Cargando />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function valor(f: Filtros, clave: string) {
  const v = f[clave];
  return ((Array.isArray(v) ? v[0] : v) ?? "").slice(0, 80);
}

function enlace(f: { q: string; categoria?: string; abiertos: boolean; gratis: boolean }) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.categoria) p.set("categoria", f.categoria);
  if (f.abiertos) p.set("abiertos", "1");
  if (f.gratis) p.set("gratis", "1");
  const s = p.toString();
  return s ? `/negocios?${s}` : "/negocios";
}

async function Resultados({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const q = valor(f, "q");
  const categoria = buscarCategoria(valor(f, "categoria"));
  const abiertos = valor(f, "abiertos") === "1";
  const gratis = valor(f, "gratis") === "1";
  const actual = { q, categoria: categoria?.slug, abiertos, gratis };

  const resultados = (await buscar(q, categoria?.slug)).filter(
    ({ negocio: n }) =>
      (!abiertos || n.abierto) && (!gratis || (n.aceptaEntrega && n.costoEnvio === 0)),
  );

  const titulo = q ? `“${q}”` : categoria ? categoria.nombre : "Todos los negocios";

  return (
    <>
      <section aria-label="Categorías" className="mt-4 md:mt-8">
        <CarruselCategorias activa={categoria?.slug} />
      </section>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] md:text-[36px]">
            {titulo}
          </h1>
          <p className="mt-0.5 text-sm text-suave">
            {resultados.length === 1 ? "1 negocio" : `${resultados.length} negocios`}
            {q && categoria && ` en ${categoria.nombre}`}
          </p>
        </div>
        <ul aria-label="Filtros" className="flex gap-2">
          <li>
            <Filtro href={enlace({ ...actual, abiertos: !abiertos })} activo={abiertos}>
              Abiertos ahora
            </Filtro>
          </li>
          <li>
            <Filtro href={enlace({ ...actual, gratis: !gratis })} activo={gratis}>
              Envío gratis
            </Filtro>
          </li>
        </ul>
      </div>

      {resultados.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-superficie px-6 py-14 text-center">
          <p className="font-display text-xl font-bold">
            {q ? `Nadie vende “${q}” todavía` : "No hay negocios con estos filtros"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-suave">
            Prueba con otra palabra, como “tacos”, “pan” o “pizza”, o quita los filtros.
          </p>
          <Link
            href="/negocios"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-5 font-semibold text-white"
          >
            Ver todos los negocios
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resultados.map(({ negocio, coincidencias }, i) => (
            <li key={negocio.id}>
              <TarjetaNegocio negocio={negocio} prioridad={i < 2}>
                {coincidencias.length > 0 && (
                  <ul className="mt-2 space-y-1 border-l-2 border-dorado-400 pl-3 text-sm">
                    {coincidencias.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span className="truncate">{p.nombre}</span>
                        <span className="shrink-0 font-semibold">{dinero(p.precio)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TarjetaNegocio>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Filtro({
  href,
  activo,
  children,
}: {
  href: string;
  activo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-pressed={activo}
      scroll={false}
      className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
        activo ? "bg-foreground text-white" : "bg-superficie hover:bg-superficie-2"
      }`}
    >
      {children}
    </Link>
  );
}

function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando negocios">
      <div className="mt-4 flex gap-3 overflow-hidden md:mt-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square w-[76px] shrink-0 animate-pulse rounded-2xl bg-superficie md:w-[130px]" />
        ))}
      </div>
      <div className="mt-8 h-9 w-56 animate-pulse rounded-lg bg-superficie" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[16/10] animate-pulse rounded-xl bg-superficie" />
        ))}
      </div>
    </div>
  );
}
