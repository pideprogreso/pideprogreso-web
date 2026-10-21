import { MapPin } from "lucide-react";
import Link from "next/link";
import { Buscador } from "./buscador";
import { BotonPedido } from "./carrito/boton-pedido";
import { Marca } from "./marca";

export function Encabezado() {
  return (
    <header className="bg-white md:sticky md:top-0 md:z-30 md:border-b md:border-borde">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 md:gap-x-6 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:h-[72px] md:flex-nowrap md:px-8 md:py-0">
        <Marca />
        <p className="ml-auto inline-flex items-center gap-1 text-[13px] font-semibold md:ml-0 md:text-sm md:font-medium">
          <MapPin aria-hidden size={15} className="text-vino-700" />
          <span>
            Nuevo Progreso<span className="hidden md:inline">, Tamps.</span>
          </span>
        </p>
        <div className="order-last w-full md:order-none md:ml-auto md:max-w-xl md:flex-1">
          <Buscador />
        </div>
        <nav aria-label="Cuenta" className="hidden items-center gap-2 md:flex">
          <BotonPedido />
          <Link
            href="/cuenta"
            className="inline-flex h-11 items-center rounded-full px-4 text-[15px] font-semibold hover:bg-superficie"
          >
            Cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}
