"use client";

import { useOptimistic, useTransition } from "react";
import { Interruptor } from "@/components/campos";
import { cambiarAbierto } from "./acciones";

export function InterruptorAbierto({ abierto }: { abierto: boolean }) {
  const [valor, ponerValor] = useOptimistic(abierto);
  const [, iniciar] = useTransition();

  return (
    <label
      className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-3.5 pr-1.5 ${valor ? "bg-[#e6f4ec]" : "bg-superficie"}`}
    >
      <span className={`text-sm font-bold ${valor ? "text-abierto" : "text-suave"}`}>
        {valor ? "Abierto" : "Cerrado"}
      </span>
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
    </label>
  );
}
