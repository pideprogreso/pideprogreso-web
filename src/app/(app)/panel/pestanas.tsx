"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export const PESTANAS = [
  { href: "/panel", texto: "Pedidos" },
  { href: "/panel/menu", texto: "Menú" },
  { href: "/panel/negocio", texto: "Mi negocio" },
] as const;

export function esPestanaActiva(href: string, ruta: string) {
  return href === "/panel" ? ruta === "/panel" : ruta.startsWith(href);
}

// En celular estas secciones van en la barra inferior.
export function PestanasPanel() {
  return (
    <Suspense fallback={<Pestanas ruta={null} />}>
      <PestanasConRuta />
    </Suspense>
  );
}

function PestanasConRuta() {
  return <Pestanas ruta={usePathname()} />;
}

function Pestanas({ ruta }: { ruta: string | null }) {
  return (
    <nav aria-label="Panel" className="mt-6 hidden gap-1 border-b border-borde md:flex">
      {PESTANAS.map(({ href, texto }) => {
        const activa = ruta !== null && esPestanaActiva(href, ruta);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-3 font-semibold ${
              activa ? "border-foreground" : "border-transparent text-suave hover:text-foreground"
            }`}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
