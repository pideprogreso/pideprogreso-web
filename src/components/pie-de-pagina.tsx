import Link from "next/link";
import { Marca } from "./marca";

export function PieDePagina() {
  return (
    <footer className="hidden border-t border-borde bg-superficie md:block">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-8 px-8 py-10">
        <div>
          <Marca />
          <p className="mt-3 text-sm text-suave">Hecho para la gente de Nuevo Progreso, Tamps.</p>
        </div>
        <nav aria-label="Pie de página" className="flex gap-10 text-sm">
          <ul className="space-y-2">
            <li className="font-semibold">Para clientes</li>
            <li><Link href="/negocios" className="text-suave hover:text-foreground">Todos los negocios</Link></li>
            <li><Link href="/pedidos" className="text-suave hover:text-foreground">Mis pedidos</Link></li>
          </ul>
          <ul className="space-y-2">
            <li className="font-semibold">Para negocios</li>
            <li><Link href="/registro-negocio" className="text-suave hover:text-foreground">Registrar mi negocio</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
