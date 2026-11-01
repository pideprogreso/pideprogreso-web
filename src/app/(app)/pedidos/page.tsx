import { ChevronRight, Receipt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FotoNegocio } from "@/components/foto";
import { ESTADOS_FINALES, etiquetaCorta } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import { obtenerMisPedidos } from "@/lib/pedidos";

export const metadata: Metadata = { title: "Mis pedidos" };

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Matamoros",
});

export default function PaginaPedidos() {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8">
      <h1 className="pt-6 font-display text-[28px] font-extrabold tracking-[-0.02em] md:pt-10 md:text-[36px]">
        Mis pedidos
      </h1>
      <Suspense fallback={<Cargando />}>
        <Lista />
      </Suspense>
    </div>
  );
}

async function Lista() {
  const pedidos = await obtenerMisPedidos();

  if (pedidos.length === 0) {
    return (
      <div className="mt-8 rounded-3xl bg-superficie px-6 py-14 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-white">
          <Receipt aria-hidden size={28} />
        </span>
        <p className="mt-4 font-display text-xl font-bold">Aún no haces pedidos</p>
        <p className="mx-auto mt-1 max-w-xs text-suave">
          Aquí verás tus pedidos de este celular y en qué va cada uno.
        </p>
        <Link
          href="/negocios"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-foreground px-6 font-semibold text-white"
        >
          Ver negocios
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-borde">
      {pedidos.map((p) => {
        const activo = !ESTADOS_FINALES.includes(p.estado);
        return (
          <li key={p.id}>
            <Link href={`/pedidos/${p.id}`} className="flex items-center gap-4 py-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-superficie [container-type:inline-size]">
                <FotoNegocio src={p.negocio.portadaUrl} nombre={p.negocio.nombre} sizes="64px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{p.negocio.nombre}</span>
                <span className="block text-sm text-suave">
                  #{p.folio}, {fecha.format(new Date(p.creadoEn))}
                </span>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                    activo ? "bg-vino-700 text-white" : "bg-superficie text-suave"
                  }`}
                >
                  {etiquetaCorta(p.estado)}
                </span>
              </span>
              <span className="font-semibold tabular-nums">{dinero(p.total)}</span>
              <ChevronRight aria-hidden size={18} className="text-suave" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Cargando() {
  return (
    <div className="mt-6 space-y-4" aria-busy="true" aria-label="Cargando pedidos">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-superficie" />
      ))}
    </div>
  );
}
