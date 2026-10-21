"use client";

import { BellRing } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Suena y vibra cuando llega un pedido nuevo, y lo marca en el título de la pestaña.
// El navegador solo deja sonar después de que la persona toca la pantalla una vez.
export function AvisoPedidos({ nuevos }: { nuevos: string[] }) {
  const vistos = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const [sonidoListo, setSonidoListo] = useState(false);

  useEffect(() => {
    const activar = () => {
      if (!audio.current) audio.current = new AudioContext();
      void audio.current.resume();
      setSonidoListo(true);
    };
    window.addEventListener("pointerdown", activar, { once: true });
    return () => window.removeEventListener("pointerdown", activar);
  }, []);

  useEffect(() => {
    const titulo = document.title.replace(/^\(\d+\) /, "");
    document.title = nuevos.length > 0 ? `(${nuevos.length}) ${titulo}` : titulo;

    if (vistos.current === null) {
      vistos.current = new Set(nuevos);
      return;
    }
    const llegaron = nuevos.filter((id) => !vistos.current!.has(id));
    nuevos.forEach((id) => vistos.current!.add(id));
    if (llegaron.length === 0) return;

    navigator.vibrate?.([300, 150, 300]);
    const ctx = audio.current;
    if (ctx && ctx.state === "running") {
      [0, 0.25, 0.5].forEach((t, i) => {
        const osc = ctx.createOscillator();
        const vol = ctx.createGain();
        osc.frequency.value = i === 2 ? 1175 : 880;
        vol.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        vol.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
        osc.connect(vol).connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.25);
      });
    }
  }, [nuevos]);

  useEffect(() => () => {
    document.title = document.title.replace(/^\(\d+\) /, "");
  }, []);

  if (sonidoListo) return null;
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl bg-superficie px-4 py-3 text-left text-sm"
    >
      <BellRing aria-hidden size={20} className="shrink-0 text-vino-700" />
      <span>
        <strong>Toca aquí para activar el sonido</strong> de pedidos nuevos. Deja esta pantalla abierta.
      </span>
    </button>
  );
}
