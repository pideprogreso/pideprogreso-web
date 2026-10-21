import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { obtenerPedidosAdmin, requerirAdmin } from "@/lib/admin";
import { ESTADOS_FINALES, etiquetaCorta } from "@/lib/estados";
import { dinero } from "@/lib/formato";

export const metadata: Metadata = { title: "Pedidos · Administración" };

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Matamoros",
});

export default function PaginaPedidosAdmin() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-superficie" />}>
      <Lista />
    </Suspense>
  );
}

async function Lista() {
  await requerirAdmin();
  const pedidos = await obtenerPedidosAdmin();
  if (pedidos.length === 0) return <p className="mt-8 text-suave">Aún no hay pedidos.</p>;

  return (
    <ul className="mt-6 divide-y divide-borde">
      {pedidos.map((p) => {
        const activo = !ESTADOS_FINALES.includes(p.estado);
        return (
          <li key={p.id}>
            <Link href={`/pedidos/${p.id}`} className="flex items-center gap-3 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  #{p.folio} · {p.negocio}
                </span>
                <span className="block truncate text-sm text-suave">
                  {p.cliente} · {fecha.format(new Date(p.creadoEn))}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  activo ? "bg-vino-700 text-white" : "bg-superficie text-suave"
                }`}
              >
                {etiquetaCorta(p.estado)}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{dinero(p.total)}</span>
              <ChevronRight aria-hidden size={18} className="shrink-0 text-suave" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
