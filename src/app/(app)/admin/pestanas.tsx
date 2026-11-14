"use client";

import { CalendarClock, Flag, LayoutDashboard, Receipt, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PESTANAS = [
  { href: "/admin", texto: "Resumen", Icono: LayoutDashboard },
  { href: "/admin/pedidos", texto: "Pedidos", Icono: Receipt },
  { href: "/admin/reportes", texto: "Reportes", Icono: Flag },
  { href: "/admin/interesados", texto: "Interesados", Icono: UserPlus },
] as const;

export function PestanasAdmin({
  avisos = {},
  actualizado,
}: {
  avisos?: Partial<Record<(typeof PESTANAS)[number]["href"], number>>;
  actualizado?: string;
}) {
  const ruta = usePathname();
  return (
    <nav
      aria-label="Administración"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 md:sticky md:top-24 md:mx-0 md:min-h-[calc(100dvh-8rem)] md:flex-col md:gap-1 md:overflow-visible md:rounded-3xl md:bg-vino-900 md:p-3"
    >
      <div className="hidden px-3 pb-6 pt-4 md:block">
        <p className="font-display text-xl font-extrabold leading-tight text-white">PideProgreso</p>
        <p className="text-xs font-bold uppercase tracking-wider text-dorado-300">Administración</p>
      </div>
      {PESTANAS.map(({ href, texto, Icono }) => {
        const activa = href === "/admin" ? ruta === "/admin" : ruta.startsWith(href);
        const aviso = avisos[href] ?? 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={`pulsable relative inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full px-4 font-semibold transition-colors md:rounded-xl ${
              activa
                ? "bg-foreground text-white md:bg-dorado-400 md:text-vino-900"
                : "bg-superficie hover:bg-superficie-2 md:bg-transparent md:text-white/75 md:hover:bg-white/10 md:hover:text-white"
            }`}
          >
            <Icono aria-hidden size={18} className="shrink-0" />
            {texto}
            {aviso > 0 && (
              <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-red-600 px-1.5 text-xs font-bold tabular-nums text-white">
                {aviso}
                <span className="sr-only"> pendientes</span>
              </span>
            )}
          </Link>
        );
      })}
      {actualizado && (
        <p className="mt-auto hidden items-center gap-2 border-t border-white/10 px-3 pb-2 pt-4 text-xs text-white/60 md:flex">
          <CalendarClock aria-hidden size={16} className="shrink-0" />
          Actualizado {actualizado}
        </p>
      )}
    </nav>
  );
}
