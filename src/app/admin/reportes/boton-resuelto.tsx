"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { marcarReporte } from "../acciones";

export function BotonResuelto({ id, resuelto }: { id: string; resuelto: boolean }) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={enviando}
      onClick={() =>
        iniciar(async () => {
          const r = await marcarReporte(id, !resuelto);
          if (!r.ok) alert(r.error);
          router.refresh();
        })
      }
      className="h-10 rounded-full border border-borde px-4 text-sm font-semibold hover:bg-superficie disabled:opacity-50"
    >
      {resuelto ? "Volver a abrir" : "Marcar como resuelto"}
    </button>
  );
}
