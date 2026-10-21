import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { FotoNegocio } from "@/components/foto";
import { requerirNegocio } from "@/lib/panel";
import { InterruptorAbierto } from "./interruptor-abierto";
import { PestanasPanel } from "./pestanas";

export default function LayoutPanel({ children }: LayoutProps<"/panel">) {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8">
      <Suspense fallback={<div className="mt-4 h-24 animate-pulse rounded-2xl bg-superficie md:mt-8" />}>
        <Cabecera />
      </Suspense>
      <PestanasPanel />
      {children}
    </div>
  );
}

async function Cabecera() {
  const negocio = await requerirNegocio();
  return (
    <header className="pt-4 md:pt-8">
      <div className="flex items-center gap-3 md:gap-4">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-superficie [container-type:inline-size] md:size-16">
          <FotoNegocio src={negocio.logoUrl ?? negocio.portadaUrl} nombre={negocio.nombre} sizes="64px" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-extrabold tracking-[-0.01em] md:text-2xl">{negocio.nombre}</h1>
          {negocio.estado === "aprobado" ? (
            <Link
              href={`/negocios/${negocio.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-suave hover:text-foreground"
            >
              Ver mi página <ExternalLink aria-hidden size={14} />
            </Link>
          ) : (
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                negocio.estado === "pendiente" ? "bg-dorado-100 text-dorado-800" : "bg-vino-50 text-vino-700"
              }`}
            >
              {negocio.estado === "pendiente" ? "En revisión" : "Suspendido"}
            </span>
          )}
        </div>
        <InterruptorAbierto abierto={negocio.abierto} />
      </div>
      {negocio.estado === "pendiente" && (
        <p className="mt-4 rounded-2xl bg-dorado-100 px-4 py-3 text-sm text-dorado-800">
          Estamos revisando tu negocio. Mientras, sube tu menú y tus fotos: en cuanto lo aprobemos, aparecerás
          en PideProgreso.
        </p>
      )}
      {negocio.estado === "suspendido" && (
        <p className="mt-4 rounded-2xl bg-vino-50 px-4 py-3 text-sm text-vino-700">
          Tu negocio está suspendido y no aparece en PideProgreso. Escríbenos para reactivarlo.
        </p>
      )}
    </header>
  );
}
