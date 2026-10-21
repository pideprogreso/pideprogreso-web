"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Vuelve a pedir el estado del pedido cada 15 s mientras la pestaña está visible.
export function Actualizador({ cadaMs = 15000 }: { cadaMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, cadaMs);
    const alVolver = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [router, cadaMs]);
  return null;
}
