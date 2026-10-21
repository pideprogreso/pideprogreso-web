"use client";

import { useEffect, useRef } from "react";

// Captcha de Cloudflare Turnstile. Supabase Auth verifica el token.
// Sin NEXT_PUBLIC_TURNSTILE_SITE_KEY no se muestra y los formularios funcionan igual.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const captchaActivo = Boolean(SITE_KEY);

declare global {
  interface Window {
    turnstile?: {
      render(el: HTMLElement, opciones: Record<string, unknown>): string;
      remove(id: string): void;
    };
  }
}

let cargando: Promise<void> | null = null;
function cargarScript() {
  cargando ??= new Promise((ok, falla) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => {
      cargando = null;
      falla(new Error("No cargó el captcha"));
    };
    document.head.appendChild(s);
  });
  return cargando;
}

// Cada token sirve una sola vez: el formulario cambia la `key` después de enviar para pedir otro.
export function Captcha({ onToken }: { onToken: (token: string | null) => void }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let id: string | undefined;
    let vivo = true;
    cargarScript()
      .then(() => {
        if (!vivo || !caja.current || !window.turnstile) return;
        id = window.turnstile.render(caja.current, {
          sitekey: SITE_KEY,
          language: "es",
          callback: (t: string) => onToken(t),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));
    return () => {
      vivo = false;
      if (id) window.turnstile?.remove(id);
    };
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={caja} className="min-h-[65px]" />;
}
