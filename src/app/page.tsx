import { MapPin } from "lucide-react";
import Link from "next/link";
import { AvisoDemo } from "@/components/aviso-demo";
import { Buscador } from "@/components/buscador";
import { CarruselCategorias } from "@/components/carrusel-categorias";
import { TarjetaNegocio } from "@/components/tarjeta-negocio";
import { obtenerNegocios } from "@/lib/datos";

export default async function Inicio() {
  const negocios = await obtenerNegocios();
  const abiertos = negocios.filter((n) => n.abierto);
  const rapidos = [...abiertos].sort((a, b) => a.tiempoMax - b.tiempoMax).slice(0, 6);

  return (
    <>
      <header className="bg-vino-700 px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1rem)] text-white md:rounded-b-[2rem] md:px-8">
        <div className="flex items-center justify-between">
          <p className="font-display text-[1.6rem] font-extrabold tracking-tight">
            pide<span className="text-dorado-400">progreso</span>
          </p>
          <p className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-sm">
            <MapPin aria-hidden size={15} className="text-dorado-300" />
            Nuevo Progreso
          </p>
        </div>
        <h1 className="mt-6 max-w-md font-display text-[2rem] font-bold leading-[1.05] tracking-tight">
          Pide a los negocios de tu pueblo
        </h1>
        <div className="mt-5 max-w-xl">
          <Buscador />
        </div>
      </header>

      <div className="relative -mt-5 rounded-t-[1.75rem] bg-background pt-5 md:mt-6 md:rounded-none md:px-8 md:pt-0">
        <section aria-label="Categorías" className="px-4 md:px-0">
          <CarruselCategorias />
        </section>

        <AvisoDemo />

        {rapidos.length > 0 && (
          <section className="mt-7">
            <div className="flex items-baseline justify-between px-4 md:px-0">
              <h2 className="font-display text-xl font-bold tracking-tight">Llegan rápido</h2>
              <Link href="/negocios" className="text-sm font-semibold text-vino-700 dark:text-dorado-300">
                Ver todos
              </Link>
            </div>
            <ul className="carrusel mt-3 flex gap-4 overflow-x-auto px-4 md:px-0">
              {rapidos.map((n, i) => (
                <li key={n.id}>
                  <TarjetaNegocio negocio={n} compacta prioridad={i < 2} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mx-4 mt-8 overflow-hidden rounded-3xl bg-vino-900 text-white md:mx-0">
          <div className="relative p-5 pb-6">
            <div
              aria-hidden
              className="absolute -bottom-16 -right-16 size-48 rounded-full border-[18px] border-dorado-400"
            />
            <h2 className="relative max-w-[17rem] font-display text-2xl font-bold leading-tight">
              ¿Tienes un negocio en Nuevo Progreso?
            </h2>
            <p className="relative mt-2 max-w-[13rem] text-sm text-vino-100">
              Sube tu menú y recibe pedidos desde el celular.
            </p>
            <Link
              href="/registro-negocio"
              className="relative mt-4 inline-flex h-11 items-center rounded-full bg-dorado-400 px-5 text-sm font-bold text-vino-900 hover:bg-dorado-300"
            >
              Registrar mi negocio
            </Link>
          </div>
        </section>

        <section className="mt-8 px-4 md:px-0">
          <h2 className="font-display text-xl font-bold tracking-tight">Todos los negocios</h2>
          <ul className="mt-3 grid gap-6 md:grid-cols-3">
            {negocios.map((n) => (
              <li key={n.id}>
                <TarjetaNegocio negocio={n} />
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 px-4 text-center text-sm text-suave">
          Hecho para la gente de Nuevo Progreso, Tamps.
        </p>
      </div>
    </>
  );
}
