"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Accion } from "@/lib/estados";
import { cambiarEstado } from "./acciones";

const CONFIRMAR: Partial<Record<Accion["estado"], string>> = {
  rechazado: "¿Rechazar este pedido? El cliente verá que no pudiste tomarlo.",
  cancelado: "¿Cancelar este pedido? El cliente verá que se canceló.",
};

export function BotonesEstado({ pedidoId, acciones }: { pedidoId: string; acciones: Accion[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  if (acciones.length === 0) return null;

  function hacer(a: Accion) {
    const pregunta = CONFIRMAR[a.estado];
    if (pregunta && !window.confirm(pregunta)) return;
    setError(null);
    iniciar(async () => {
      const r = await cambiarEstado(pedidoId, a.estado);
      if (!r.ok) setError(r.error);
      router.refresh();
    });
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex gap-2">
        {acciones
          .filter((a) => !a.principal)
          .map((a) => (
            <button
              key={a.estado}
              type="button"
              disabled={enviando}
              onClick={() => hacer(a)}
              className="h-12 shrink-0 rounded-full border border-borde px-4 text-sm font-semibold hover:bg-superficie disabled:opacity-50"
            >
              {a.texto}
            </button>
          ))}
        {acciones
          .filter((a) => a.principal)
          .map((a) => (
            <button
              key={a.estado}
              type="button"
              disabled={enviando}
              onClick={() => hacer(a)}
              className="h-12 min-w-0 flex-1 rounded-full bg-vino-700 px-4 font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
            >
              {enviando ? "…" : a.texto}
            </button>
          ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-vino-700">
          {error}
        </p>
      )}
    </div>
  );
}
