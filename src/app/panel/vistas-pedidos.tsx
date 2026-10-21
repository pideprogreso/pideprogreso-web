"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Vista = { clave: string; texto: string; cuenta: number; resaltada?: boolean; contenido: React.ReactNode };

// Pestañas por etapa: cada pedido vive en una sola, sin hacer scroll largo.
export function VistasPedidos({ vistas, vacio }: { vistas: Vista[]; vacio: React.ReactNode }) {
  const [activa, setActiva] = useState(() => vistas.find((v) => v.cuenta > 0)?.clave ?? vistas[0].clave);
  const nuevos = vistas[0].cuenta;
  const antes = useRef(nuevos);

  // Si llega un pedido nuevo, se brinca a "Nuevos".
  useEffect(() => {
    if (nuevos > antes.current) setActiva(vistas[0].clave);
    antes.current = nuevos;
  }, [nuevos, vistas]);

  const vista = vistas.find((v) => v.clave === activa) ?? vistas[0];
  return (
    <div>
      <div role="tablist" aria-label="Etapas" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {vistas.map((v) => {
          const on = v.clave === vista.clave;
          return (
            <button
              key={v.clave}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiva(v.clave)}
              className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${
                on ? "bg-foreground text-white" : "bg-superficie text-foreground hover:bg-superficie-2"
              }`}
            >
              {v.texto}
              <span
                className={`min-w-5 rounded-full px-1.5 text-xs tabular-nums ${
                  v.resaltada && v.cuenta > 0 ? "bg-vino-700 text-white" : on ? "bg-white/20" : "bg-white text-suave"
                }`}
              >
                {v.cuenta}
              </span>
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="mt-4">
        {vista.cuenta > 0 ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{vista.contenido}</div> : vacio}
      </div>
    </div>
  );
}

// Fila compacta: el resumen abre el detalle; la acción principal queda siempre a la vista.
export function Desplegable({
  resumen,
  accion,
  children,
}: {
  resumen: React.ReactNode;
  accion: React.ReactNode;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">{resumen}</span>
          <ChevronDown aria-hidden size={18} className={`shrink-0 text-suave transition-transform ${abierto ? "rotate-180" : ""}`} />
        </button>
        {accion}
      </div>
      {abierto && <div className="mt-3 border-t border-borde pt-3">{children}</div>}
    </>
  );
}
