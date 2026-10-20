import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";

export function CarruselCategorias({ activa }: { activa?: string }) {
  return (
    <ul className="carrusel -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:justify-between md:px-0">
      {CATEGORIAS.map((c) => {
        const esActiva = activa === c.slug;
        return (
          <li key={c.slug}>
            <Link
              href={esActiva ? "/negocios" : `/negocios?categoria=${c.slug}`}
              aria-current={esActiva ? "true" : undefined}
              className="flex w-[4.75rem] flex-col items-center gap-1.5 py-1"
            >
              <span
                className={`grid size-16 place-items-center rounded-full text-3xl transition-transform active:scale-95 ${
                  esActiva ? "ring-[3px] ring-vino-700 ring-offset-2 ring-offset-background" : ""
                }`}
                style={{ backgroundColor: c.fondo }}
              >
                <span aria-hidden>{c.icono}</span>
              </span>
              <span
                className={`text-[13px] leading-tight ${esActiva ? "font-bold text-vino-700 dark:text-dorado-300" : "font-medium"}`}
              >
                {c.nombre}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
