"use client";

import { BellRing } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type PedidoNuevo = { id: string; folio: number; nombre: string; total: string };

// Avisa cuando llega un pedido nuevo: sonido, vibración, notificación del navegador
// y el número de pedidos nuevos en el título de la pestaña.
// El navegador solo deja sonar y notificar después de que la persona toca la pantalla.
export function AvisoPedidos({ nuevos }: { nuevos: PedidoNuevo[] }) {
  const vistos = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const activar = () => {
      if (!audio.current) audio.current = new AudioContext();
      void audio.current.resume();
      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission();
      }
      setListo(true);
    };
    window.addEventListener("pointerdown", activar, { once: true });
    // En Android las notificaciones necesitan un service worker.
    navigator.serviceWorker?.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("pointerdown", activar);
  }, []);

  useEffect(() => {
    const titulo = document.title.replace(/^\(\d+\) /, "");
    document.title = nuevos.length > 0 ? `(${nuevos.length}) ${titulo}` : titulo;

    if (vistos.current === null) {
      vistos.current = new Set(nuevos.map((p) => p.id));
      return;
    }
    const llegaron = nuevos.filter((p) => !vistos.current!.has(p.id));
    llegaron.forEach((p) => vistos.current!.add(p.id));
    if (llegaron.length === 0) return;

    navigator.vibrate?.([300, 150, 300]);
    sonar(audio.current);
    llegaron.forEach(notificar);
  }, [nuevos]);

  useEffect(
    () => () => {
      document.title = document.title.replace(/^\(\d+\) /, "");
    },
    [],
  );

  if (listo) return null;
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl bg-superficie px-4 py-3 text-left text-sm"
    >
      <BellRing aria-hidden size={20} className="shrink-0 text-vino-700" />
      <span>
        <strong>Toca aquí para activar los avisos</strong> de pedidos nuevos (sonido y notificación). Deja esta
        pantalla abierta.
      </span>
    </button>
  );
}

function sonar(ctx: AudioContext | null) {
  if (!ctx || ctx.state !== "running") return;
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

async function notificar(p: PedidoNuevo) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const titulo = `Pedido nuevo #${p.folio}`;
  const opciones: NotificationOptions = { body: `${p.nombre} · ${p.total}`, tag: p.id, icon: "/favicon.ico" };
  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    if (registro) await registro.showNotification(titulo, opciones);
    else new Notification(titulo, opciones);
  } catch {
    // Algunos navegadores no permiten notificaciones aquí; queda el sonido.
  }
}
