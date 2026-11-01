"use client";

import { Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PagoMes } from "@/lib/admin";
import { destacarNegocio, registrarPago } from "./acciones";

const METODO = { transferencia: "Transferencia", mercado_pago: "Mercado Pago", efectivo: "Efectivo" } as const;
const dia = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "America/Matamoros" });

// La cuota del mes y el lugar destacado de un negocio publicado.
export function ControlesCobro({
  id,
  mes,
  nombreMes,
  pago,
  destacadoHasta,
}: {
  id: string;
  mes: string;
  nombreMes: string;
  pago: PagoMes | undefined;
  destacadoHasta: string | null;
}) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();
  const [monto, setMonto] = useState("149");
  const [metodo, setMetodo] = useState<keyof typeof METODO>("transferencia");
  const hacer = (accion: () => Promise<{ ok: boolean; error?: string }>) =>
    iniciar(async () => {
      const r = await accion();
      if (!r.ok) alert(r.error);
      router.refresh();
    });

  return (
    <div className="mt-3 space-y-2 border-t border-borde pt-3 text-sm">
      {pago ? (
        <p className="flex items-center gap-2 font-semibold text-abierto">
          <Check aria-hidden size={16} strokeWidth={3} />
          Cuota de {nombreMes} pagada: ${pago.monto} por {METODO[pago.metodo].toLowerCase()}
        </p>
      ) : (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            hacer(() => registrarPago(id, mes, Number(monto), metodo));
          }}
        >
          <span className="font-semibold text-dorado-800">Cuota de {nombreMes} pendiente</span>
          <label className="relative">
            <span className="sr-only">Monto</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-suave">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="h-10 w-24 rounded-xl border border-borde pl-6 pr-2"
            />
          </label>
          <label>
            <span className="sr-only">Cómo pagó</span>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as keyof typeof METODO)}
              className="h-10 rounded-xl border border-borde bg-white px-2"
            >
              {Object.entries(METODO).map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={enviando}
            className="h-10 rounded-full bg-foreground px-4 font-semibold text-white disabled:opacity-50"
          >
            Registrar pago
          </button>
        </form>
      )}

      <div className="flex items-center gap-2">
        <Star aria-hidden size={16} className={destacadoHasta ? "fill-dorado-400 text-dorado-400" : "text-suave"} />
        <span className="flex-1">{destacadoHasta ? `Destacado hasta el ${dia.format(new Date(destacadoHasta))}` : "No destacado"}</span>
        <button
          type="button"
          disabled={enviando}
          onClick={() => hacer(() => destacarNegocio(id, destacadoHasta ? 0 : 7))}
          className="h-10 rounded-full border border-borde px-4 font-semibold hover:bg-superficie disabled:opacity-50"
        >
          {destacadoHasta ? "Quitar" : "Destacar 7 días"}
        </button>
      </div>
    </div>
  );
}
