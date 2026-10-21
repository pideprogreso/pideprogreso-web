"use client";

import { Check, MessageSquareWarning, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { enviarReporte } from "@/app/reportes/acciones";
import { Aviso, estiloCampo } from "./campos";

// Abre un formulario corto para reportar un problema de la página actual.
export function BotonReportar({ className = "" }: { className?: string }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const pagina = usePathname();
  const [texto, setTexto] = useState("");
  const [contacto, setContacto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, iniciar] = useTransition();

  function abrir() {
    setEnviado(false);
    setError(null);
    dialogo.current?.showModal();
  }

  return (
    <>
      <button type="button" onClick={abrir} className={`inline-flex items-center gap-1.5 ${className}`}>
        <MessageSquareWarning aria-hidden size={16} />
        Reportar un problema
      </button>
      <dialog
        ref={dialogo}
        aria-labelledby="titulo-reporte"
        onClick={(e) => e.target === dialogo.current && dialogo.current?.close()}
        className="m-auto w-[min(100%-2rem,28rem)] rounded-3xl p-0 backdrop:bg-black/40"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="titulo-reporte" className="font-display text-xl font-bold">
              {enviado ? "¡Gracias!" : "Reportar un problema"}
            </h2>
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label="Cerrar"
              className="-mr-2 -mt-1 grid size-10 place-items-center rounded-full hover:bg-superficie"
            >
              <X aria-hidden size={20} />
            </button>
          </div>
          {enviado ? (
            <p className="mt-3 flex items-start gap-2 text-suave">
              <Check aria-hidden size={20} className="shrink-0 text-abierto" />
              Recibimos tu reporte. Lo revisamos para arreglarlo lo antes posible.
            </p>
          ) : (
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                iniciar(async () => {
                  const r = await enviarReporte({ pagina: pagina ?? "/", texto, contacto });
                  if (!r.ok) return setError(r.error);
                  setTexto("");
                  setEnviado(true);
                });
              }}
            >
              <label htmlFor="reporte-texto" className="block text-sm text-suave">
                ¿Qué pasó? Algo que no carga, un precio mal o cualquier cosa rara.
              </label>
              <textarea
                id="reporte-texto"
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className={`${estiloCampo} h-auto py-3`}
              />
              <input
                aria-label="Tu celular o correo (opcional)"
                placeholder="Tu celular o correo (opcional)"
                maxLength={120}
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                className={estiloCampo}
              />
              {error && <Aviso>{error}</Aviso>}
              <button
                type="submit"
                disabled={enviando}
                className="flex h-12 w-full items-center justify-center rounded-full bg-vino-700 font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Enviar reporte"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
