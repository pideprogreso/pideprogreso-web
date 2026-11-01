"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { marcarInteresado } from "../acciones";

export function BotonContactado({ id, contactado }: { id: string; contactado: boolean }) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={enviando}
      onClick={() =>
        iniciar(async () => {
          const r = await marcarInteresado(id, !contactado);
          if (!r.ok) alert(r.error);
          router.refresh();
        })
      }
      className="h-10 rounded-full border border-borde px-4 text-sm font-semibold hover:bg-superficie disabled:opacity-50"
    >
      {contactado ? "Marcar pendiente" : "Ya lo contacté"}
    </button>
  );
}
