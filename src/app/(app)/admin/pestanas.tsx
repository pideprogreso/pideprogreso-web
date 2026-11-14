"use client";

import { Flag, LayoutDashboard, Receipt, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PESTANAS = [
  { href: "/admin", texto: "Negocios", Icono: LayoutDashboard },
  { href: "/admin/pedidos", texto: "Pedidos", Icono: Receipt },
  { href: "/admin/reportes", texto: "Reportes", Icono: Flag },
  { href: "/admin/interesados", texto: "Interesados", Icono: UserPlus },
] as const;

export function PestanasAdmin() {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Administración"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 md:sticky md:top-24 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:rounded-3xl md:bg-vino-900 md:p-3 md:px-3"
    >
      <p className="hidden px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-dorado-300 md:block">
        Administración
      </p>
      {PESTANAS.map(({ href, texto, Icono }) => {
        const activa = href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`pulsable inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 font-semibold transition-colors md:rounded-xl ${
              activa
                ? "bg-foreground text-white md:bg-dorado-400 md:text-vino-900"
                : "bg-superficie hover:bg-superficie-2 md:bg-transparent md:text-white/75 md:hover:bg-white/10 md:hover:text-white"
            }`}
          >
            <Icono aria-hidden size={18} className="shrink-0" />
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
