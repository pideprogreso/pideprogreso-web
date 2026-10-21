"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { borrarDireccion } from "../pedidos/acciones";

export function BorrarDireccion({ id, etiqueta }: { id: string; etiqueta: string }) {
  const router = useRouter();
  const [borrando, iniciar] = useTransition();
  return (
    <button
      type="button"
      disabled={borrando}
      aria-label={`Borrar dirección ${etiqueta}`}
      onClick={() => {
        if (!window.confirm(`¿Borrar la dirección "${etiqueta}"?`)) return;
        iniciar(async () => {
          const r = await borrarDireccion(id);
          if (!r.ok) alert(r.error);
          router.refresh();
        });
      }}
      className="grid size-10 shrink-0 place-items-center rounded-full text-suave hover:bg-superficie hover:text-vino-700 disabled:opacity-50"
    >
      <Trash2 aria-hidden size={18} />
    </button>
  );
}
