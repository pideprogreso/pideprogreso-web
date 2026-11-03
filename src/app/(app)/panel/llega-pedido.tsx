"use client";

import { useEffect, useState } from "react";

// Pedidos ya vistos en esta sesión: solo los que llegan después de abrir el panel se resaltan,
// no los de la primera carga ni los que reaparecen al cambiar de pestaña.
const vistos = new Set<string>();
let cargado = false;

export function LlegaPedido({ id, children }: { id: string; children: React.ReactNode }) {
  const [nuevo] = useState(() => cargado && !vistos.has(id));
  useEffect(() => {
    vistos.add(id);
    cargado = true;
  }, [id]);
  return <div className={nuevo ? "llega" : undefined}>{children}</div>;
}
