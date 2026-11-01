"use client";

import { useOptimistic, useTransition } from "react";
import { Interruptor } from "@/components/campos";
import { cambiarDisponible } from "../acciones";

export function InterruptorDisponible({ id, disponible, nombre }: { id: string; disponible: boolean; nombre: string }) {
  const [valor, ponerValor] = useOptimistic(disponible);
  const [, iniciar] = useTransition();
  return (
    <Interruptor
      activo={valor}
      etiqueta={`${nombre} disponible`}
      onCambio={(v) =>
        iniciar(async () => {
          ponerValor(v);
          const r = await cambiarDisponible(id, v);
          if (!r.ok) alert(r.error);
        })
      }
    />
  );
}
