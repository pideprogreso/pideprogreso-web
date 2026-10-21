"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { EstadoNegocio } from "@/lib/panel";
import { cambiarEstadoNegocio } from "./acciones";

const PREGUNTA: Record<EstadoNegocio, (nombre: string) => string> = {
  aprobado: (n) => `¿Publicar "${n}"? Aparecerá para todos los clientes.`,
  suspendido: (n) => `¿Quitar "${n}" de PideProgreso? Sus clientes ya no lo verán.`,
  pendiente: (n) => `¿Regresar "${n}" a revisión?`,
};

export function BotonEstadoNegocio({
  id,
  estado,
  texto,
  nombre,
  principal = false,
}: {
  id: string;
  estado: EstadoNegocio;
  texto: string;
  nombre: string;
  principal?: boolean;
}) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={enviando}
      onClick={() => {
        if (!window.confirm(PREGUNTA[estado](nombre))) return;
        iniciar(async () => {
          const r = await cambiarEstadoNegocio(id, estado);
          if (!r.ok) alert(r.error);
          router.refresh();
        });
      }}
      className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold disabled:opacity-50 ${
        principal
          ? "flex-1 justify-center bg-vino-700 text-white hover:bg-vino-800"
          : "border border-borde hover:bg-superficie"
      }`}
    >
      {enviando ? "Guardando…" : texto}
    </button>
  );
}
