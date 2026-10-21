import { Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";

export function CarruselCategorias({ activa }: { activa?: string }) {
  return (
    <ul className="carrusel -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-8 md:gap-4 md:px-0">
      {CATEGORIAS.map((c) => {
        const esActiva = activa === c.slug;
        return (
          <li key={c.slug} className="shrink-0">
            <Link
              href={esActiva ? "/negocios" : `/negocios?categoria=${c.slug}`}
              aria-current={esActiva ? "true" : undefined}
              className="group flex w-[76px] flex-col items-center gap-2 md:w-full"
            >
              <span
                className={`relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-superficie transition ${
                  esActiva
                    ? "ring-[2.5px] ring-foreground ring-offset-2"
                    : "group-hover:ring-1 group-hover:ring-borde"
                }`}
              >
                {c.foto ? (
                  <Image
                    src={c.foto}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 140px, 76px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Store aria-hidden size={28} className="text-vino-700" />
                )}
              </span>
              <span
                className={`text-center text-[13px] leading-tight ${esActiva ? "font-bold" : "font-medium"}`}
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
