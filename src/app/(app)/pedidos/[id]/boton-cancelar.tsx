"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelarPedido } from "../acciones";

export function BotonCancelar({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cancelando, iniciar] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={cancelando}
        onClick={() => {
          if (!window.confirm("¿Cancelar este pedido?")) return;
          setError(null);
          iniciar(async () => {
            const r = await cancelarPedido(id);
            if (!r.ok) setError(r.error);
            router.refresh();
          });
        }}
        className="h-11 rounded-full border border-borde px-5 text-sm font-semibold text-vino-700 hover:bg-vino-50 disabled:opacity-50"
      >
        {cancelando ? "Cancelando…" : "Cancelar pedido"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-vino-700">
          {error}
        </p>
      )}
    </div>
  );
}
