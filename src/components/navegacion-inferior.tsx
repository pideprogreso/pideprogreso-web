"use client";

import { House, Receipt, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const ENLACES = [
  { href: "/", texto: "Inicio", Icono: House },
  { href: "/negocios", texto: "Buscar", Icono: Search },
  { href: "/pedidos", texto: "Pedidos", Icono: Receipt },
  { href: "/cuenta", texto: "Cuenta", Icono: User },
] as const;

export function NavegacionInferior() {
  return (
    <Suspense fallback={<Barra ruta={null} />}>
      <BarraConRuta />
    </Suspense>
  );
}

function BarraConRuta() {
  return <Barra ruta={usePathname()} />;
}

function Barra({ ruta }: { ruta: string | null }) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-4">
        {ENLACES.map(({ href, texto, Icono }) => {
          const activo = ruta !== null && (href === "/" ? ruta === "/" : ruta.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-xs font-medium ${
                  activo ? "text-vino-700 dark:text-dorado-300" : "text-suave"
                }`}
              >
                <Icono aria-hidden size={22} strokeWidth={activo ? 2.4 : 1.8} />
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
