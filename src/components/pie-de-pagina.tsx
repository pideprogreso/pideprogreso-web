import Link from "next/link";
import { Suspense } from "react";
import { BotonReportar } from "./boton-reportar";
import { Marca } from "./marca";

const enlace = "text-suave hover:text-foreground";

export function PieDePagina() {
  return (
    <footer className="border-t border-borde bg-superficie pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:items-start md:justify-between md:px-8 md:py-10">
        <div>
          <Marca />
          <p className="mt-3 text-sm text-suave">Hecho para la gente de Nuevo Progreso, Tamps.</p>
          <Suspense>
            <BotonReportar className="mt-4 text-sm font-semibold text-vino-700 hover:underline" />
          </Suspense>
        </div>
        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-8 text-sm md:flex md:gap-10">
          <ul className="space-y-2">
            <li className="font-semibold">Para clientes</li>
            <li><Link href="/negocios" className={enlace}>Todos los negocios</Link></li>
            <li><Link href="/pedidos" className={enlace}>Mis pedidos</Link></li>
          </ul>
          <ul className="space-y-2">
            <li className="font-semibold">Para negocios</li>
            <li><Link href="/registro-negocio" className={enlace}>Registrar mi negocio</Link></li>
          </ul>
          <ul className="space-y-2">
            <li className="font-semibold">Legal</li>
            <li><Link href="/privacidad" className={enlace}>Aviso de privacidad</Link></li>
            <li><Link href="/terminos" className={enlace}>Términos y condiciones</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
