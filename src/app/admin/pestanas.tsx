"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PESTANAS = [
  { href: "/admin", texto: "Negocios" },
  { href: "/admin/pedidos", texto: "Pedidos" },
] as const;

export function PestanasAdmin() {
  const ruta = usePathname();
  return (
    <nav aria-label="Administración" className="mt-3 flex gap-2">
      {PESTANAS.map(({ href, texto }) => {
        const activa = href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`inline-flex h-11 items-center rounded-full px-5 font-semibold ${
              activa ? "bg-foreground text-white" : "bg-superficie hover:bg-superficie-2"
            }`}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
