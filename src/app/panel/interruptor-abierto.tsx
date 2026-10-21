"use client";

import { useOptimistic, useTransition } from "react";
import { Interruptor } from "@/components/campos";
import { cambiarAbierto } from "./acciones";

export function InterruptorAbierto({ abierto }: { abierto: boolean }) {
  const [valor, ponerValor] = useOptimistic(abierto);
  const [, iniciar] = useTransition();

  return (
    <label className="flex shrink-0 flex-col items-center gap-1">
      <Interruptor
        activo={valor}
        etiqueta="Recibiendo pedidos"
        onCambio={(v) =>
          iniciar(async () => {
            ponerValor(v);
            const r = await cambiarAbierto(v);
            if (!r.ok) alert(r.error);
          })
        }
      />
      <span className={`text-xs font-bold ${valor ? "text-abierto" : "text-suave"}`}>
        {valor ? "Abierto" : "Cerrado"}
      </span>
    </label>
  );
}
