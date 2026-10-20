import { Bike, Clock } from "lucide-react";
import Link from "next/link";
import { envio } from "@/lib/formato";
import type { Negocio } from "@/lib/tipos";
import { Portada } from "./portada";

export function TarjetaNegocio({
  negocio,
  compacta = false,
  prioridad = false,
  children,
}: {
  negocio: Negocio;
  compacta?: boolean;
  prioridad?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={`/negocios/${negocio.slug}`}
      className={`group block ${compacta ? "w-64 shrink-0" : ""}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
        <Portada
          src={negocio.portadaUrl}
          alt={negocio.nombre}
          categoria={negocio.categoria}
          sizes={compacta ? "256px" : "(min-width: 768px) 33vw, 100vw"}
          prioridad={prioridad}
          tamanoIcono={compacta ? "text-5xl" : "text-7xl"}
        />
        {!negocio.abierto && (
          <div className="absolute inset-0 grid place-items-center bg-vino-900/55">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-vino-900">
              Cerrado por ahora
            </span>
          </div>
        )}
        {negocio.abierto && negocio.costoEnvio === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-dorado-400 px-2.5 py-1 text-xs font-bold text-vino-900">
            Envío gratis
          </span>
        )}
      </div>
      <div className="mt-2.5">
        <h3 className="truncate text-base font-semibold group-hover:underline">
          {negocio.nombre}
        </h3>
        <p className="mt-0.5 flex items-center gap-3 text-sm text-suave">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden size={14} />
            {negocio.tiempoMin}–{negocio.tiempoMax} min
          </span>
          {negocio.aceptaEntrega ? (
            <span className="inline-flex items-center gap-1">
              <Bike aria-hidden size={15} />
              {envio(negocio.costoEnvio)}
            </span>
          ) : (
            <span>Solo para recoger</span>
          )}
        </p>
        {children}
      </div>
    </Link>
  );
}
