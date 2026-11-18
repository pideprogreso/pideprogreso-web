"use client";

import { BellRing, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { guardarSuscripcion, type SuscripcionPush } from "@/lib/acciones-push";

type Estado = "cargando" | "listo" | "pedir" | "instalar" | "bloqueado" | "no";

const llave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Botón para recibir avisos en el celular aunque la app esté cerrada (Web Push).
// En iPhone solo funciona con la app agregada a la pantalla de inicio.
export function ActivarAvisos({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    void revisar().then(setEstado);
  }, []);

  if (estado === "cargando" || estado === "listo" || estado === "no") return null;

  if (estado === "instalar") {
    return (
      <p className="flex items-start gap-3 rounded-2xl bg-dorado-100 px-4 py-3 text-sm text-dorado-800">
        <Share aria-hidden size={20} className="mt-0.5 shrink-0" />
        <span>
          Para recibir avisos en tu iPhone, toca <strong>Compartir</strong> y luego <strong>Agregar a inicio</strong>.
          Abre PideProgreso desde ese ícono.
        </span>
      </p>
    );
  }

  if (estado === "bloqueado") {
    return (
      <p className="rounded-2xl bg-superficie px-4 py-3 text-sm text-suave">
        Los avisos están bloqueados. Actívalos en los ajustes del navegador para este sitio.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const permiso = await Notification.requestPermission();
        if (permiso !== "granted") return setEstado(permiso === "denied" ? "bloqueado" : "pedir");
        setEstado((await suscribir()) ? "listo" : "pedir");
      }}
      className="flex w-full items-center gap-3 rounded-2xl bg-vino-700 px-4 py-3 text-left text-sm text-white transition-transform active:scale-[0.98]"
    >
      <BellRing aria-hidden size={20} className="shrink-0 text-dorado-400" />
      <span className="font-semibold">{texto}</span>
    </button>
  );
}

async function revisar(): Promise<Estado> {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = matchMedia("(display-mode: standalone)").matches;
  if (!llave || !("serviceWorker" in navigator)) return "no";
  if (!("PushManager" in window)) return ios && !instalada ? "instalar" : "no";
  if (Notification.permission === "denied") return "bloqueado";
  // Ya dio permiso: se vuelve a guardar en silencio por si cambió de cuenta o de celular.
  if (Notification.permission === "granted") return (await suscribir()) ? "listo" : "pedir";
  return "pedir";
}

async function suscribir() {
  try {
    const registro = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const opciones = { userVisibleOnly: true, applicationServerKey: llave };
    let sub = (await registro.pushManager.getSubscription()) ?? (await registro.pushManager.subscribe(opciones));
    if (await guardarSuscripcion(sub.toJSON() as SuscripcionPush)) return true;
    // El endpoint quedó de otra cuenta en este celular: se pide uno nuevo.
    await sub.unsubscribe();
    sub = await registro.pushManager.subscribe(opciones);
    return guardarSuscripcion(sub.toJSON() as SuscripcionPush);
  } catch (e) {
    console.error("avisos", e);
    return false;
  }
}
