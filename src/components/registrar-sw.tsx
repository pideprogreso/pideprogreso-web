"use client";

import { useEffect } from "react";

// Registra el service worker en todo el sitio: la app queda instalable y lista para avisos.
export function RegistrarSW() {
  useEffect(() => {
    navigator.serviceWorker?.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
