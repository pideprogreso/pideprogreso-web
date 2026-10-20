import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";

export default function Inicio() {
  return (
    <>
      <section className="-mx-4 bg-vino-700 px-4 pb-8 pt-6 text-white">
        <h1 className="font-display text-3xl font-bold leading-tight">
          Lo que necesitas, de los negocios de tu comunidad.
        </h1>
        <p className="mt-2 text-vino-100">
          Encuentra, elige y pide desde tu celular.
        </p>
        <form action="/negocios" className="mt-5 flex gap-2" role="search">
          <label htmlFor="buscar" className="sr-only">
            Buscar productos o negocios
          </label>
          <input
            id="buscar"
            name="q"
            type="search"
            placeholder="Hamburguesas, pan, flores…"
            className="h-12 min-w-0 flex-1 rounded-xl bg-white px-4 text-foreground placeholder:text-suave focus:outline-none focus:ring-2 focus:ring-dorado-300"
          />
          <button
            type="submit"
            className="h-12 rounded-xl bg-dorado-400 px-5 font-semibold text-vino-900 hover:bg-dorado-300"
          >
            Buscar
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">Categorías</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIAS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/negocios?categoria=${c.slug}`}
                className="flex h-full flex-col gap-2 rounded-2xl border border-borde bg-superficie p-4 hover:border-dorado-400"
              >
                <span aria-hidden className="text-2xl">
                  {c.icono}
                </span>
                <span className="text-sm font-medium leading-snug">
                  {c.nombre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-dorado-200 bg-dorado-50 p-5 text-vino-900 dark:border-dorado-700 dark:bg-vino-900 dark:text-dorado-100">
        <h2 className="font-display text-lg font-semibold">¿Tienes un negocio?</h2>
        <p className="mt-1 text-sm">
          Muestra tu catálogo y recibe pedidos sin complicaciones.
        </p>
        <Link
          href="/registro-negocio"
          className="mt-4 inline-block rounded-xl bg-vino-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-vino-600"
        >
          Registrar mi negocio
        </Link>
      </section>
    </>
  );
}
