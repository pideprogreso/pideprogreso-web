import Link from "next/link";
import type { Negocio } from "@/lib/tipos";
import { TarjetaNegocio } from "./tarjeta-negocio";

// Fila horizontal deslizable de negocios, con título y enlace a la lista completa.
export function FilaNegocios({
  titulo,
  descripcion,
  negocios,
  verTodos,
  prioridad = false,
}: {
  titulo: string;
  descripcion?: string;
  negocios: Negocio[];
  verTodos?: string;
  prioridad?: boolean;
}) {
  // Una fila de un solo negocio se ve vacía; mejor no mostrarla.
  if (negocios.length < 2) return null;
  return (
    <section className="mt-10 md:mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[22px] font-bold leading-tight tracking-tight md:text-[28px]">
            {titulo}
          </h2>
          {descripcion && <p className="mt-0.5 text-sm text-suave">{descripcion}</p>}
        </div>
        {verTodos && (
          <Link
            href={verTodos}
            className="shrink-0 rounded-full bg-superficie px-4 py-2 text-sm font-semibold hover:bg-superficie-2"
          >
            Ver todos
          </Link>
        )}
      </div>
      <ul className="carrusel -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:px-0 md:[--margen:0px]">
        {negocios.map((n, i) => (
          <li key={n.id} className="w-[78vw] max-w-[320px] shrink-0 md:w-[300px]">
            <TarjetaNegocio negocio={n} prioridad={prioridad && i < 2} sizes="320px" />
          </li>
        ))}
      </ul>
    </section>
  );
}
