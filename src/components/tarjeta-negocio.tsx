import Link from "next/link";
import { dinero } from "@/lib/formato";
import type { Negocio } from "@/lib/tipos";
import { FotoNegocio } from "./foto";

export function TarjetaNegocio({
  negocio,
  prioridad = false,
  sizes = "(min-width: 1280px) 300px, (min-width: 768px) 33vw, 90vw",
  children,
}: {
  negocio: Negocio;
  prioridad?: boolean;
  sizes?: string;
  children?: React.ReactNode;
}) {
  const gratis = negocio.aceptaEntrega && negocio.costoEnvio === 0;

  return (
    <Link href={`/negocios/${negocio.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-superficie [container-type:inline-size]">
        <FotoNegocio
          src={negocio.portadaUrl}
          nombre={negocio.nombre}
          sizes={sizes}
          prioridad={prioridad}
          className="transition-transform duration-500 ease-[var(--ease-salida)] group-hover:scale-[1.03]"
        />
        {!negocio.abierto && (
          <div className="absolute inset-0 grid place-items-center bg-black/55">
            <span className="font-display text-lg font-bold text-white">Cerrado por ahora</span>
          </div>
        )}
        {negocio.abierto && gratis && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-dorado-400 px-2.5 py-1 text-xs font-bold text-foreground">
            Envío gratis
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold leading-snug">{negocio.nombre}</h3>
          <p className="mt-0.5 text-sm text-suave">
            {negocio.aceptaEntrega
              ? gratis
                ? "Sin costo de envío"
                : `Envío ${dinero(negocio.costoEnvio)}`
              : "Solo para recoger"}
            {negocio.pedidoMinimo > 0 && `, mínimo ${dinero(negocio.pedidoMinimo)}`}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-superficie px-2.5 py-1 text-xs font-bold tabular-nums">
          {negocio.tiempoMin}–{negocio.tiempoMax} min
        </span>
      </div>
      {children}
    </Link>
  );
}
