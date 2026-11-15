"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

// En el celular abre el menú de compartir (WhatsApp, estados); en computadora descarga la imagen.
export function BotonCompartir() {
  const [ocupado, setOcupado] = useState(false);
  async function compartir() {
    setOcupado(true);
    try {
      const respuesta = await fetch("/panel/estadisticas/semana");
      if (!respuesta.ok) throw new Error("No se pudo crear la imagen");
      const archivo = new File([await respuesta.blob()], "mi-semana-pideprogreso.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], text: "Mi semana en PideProgreso" }).catch(() => {});
      } else {
        const enlace = document.createElement("a");
        enlace.href = URL.createObjectURL(archivo);
        enlace.download = archivo.name;
        enlace.click();
        URL.revokeObjectURL(enlace.href);
      }
    } catch {
      alert("No se pudo crear la imagen. Intenta de nuevo.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <button
      type="button"
      onClick={compartir}
      disabled={ocupado}
      className="pulsable inline-flex h-11 items-center gap-2 rounded-full bg-dorado-400 px-5 font-semibold text-vino-900 disabled:opacity-60"
    >
      <Share2 aria-hidden size={18} />
      {ocupado ? "Preparando…" : "Compartir mi semana"}
    </button>
  );
}
