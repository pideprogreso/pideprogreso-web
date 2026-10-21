"use client";

import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { pausarPedidos } from "./acciones";

const hora = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Matamoros" });

// Para la hora pico o la lluvia: deja de recibir pedidos unos minutos sin cerrar.
export function BotonPausa({ hasta }: { hasta: string | null }) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const pausar = (min: number) =>
    iniciar(async () => {
      const r = await pausarPedidos(min);
      if (!r.ok) alert(r.error);
      router.refresh();
    });

  if (hasta) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-dorado-100 px-4 py-3 text-dorado-800">
        <Pause aria-hidden size={20} className="shrink-0" />
        <p className="min-w-0 flex-1 text-sm">
          <strong>Pedidos en pausa</strong> hasta las {hora.format(new Date(hasta))}. Nadie puede enviarte pedidos nuevos.
        </p>
        <button
          type="button"
          disabled={enviando}
          onClick={() => pausar(0)}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-foreground disabled:opacity-50"
        >
          <Play aria-hidden size={16} />
          Reanudar
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex-1 text-suave">¿Mucho trabajo?</span>
      {[15, 30].map((min) => (
        <button
          key={min}
          type="button"
          disabled={enviando}
          onClick={() => pausar(min)}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-borde px-4 font-semibold hover:bg-superficie disabled:opacity-50"
        >
          <Pause aria-hidden size={16} />
          Pausar {min} min
        </button>
      ))}
    </div>
  );
}
