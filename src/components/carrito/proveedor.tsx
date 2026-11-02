"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type LineaCarrito = {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

// Un carrito pertenece a un solo negocio, como en un pedido real.
export type Carrito = {
  negocio: {
    id: string;
    slug: string;
    nombre: string;
    costoEnvio: number;
    pedidoMinimo: number;
    aceptaEntrega: boolean;
    aceptaRecoger: boolean;
  } | null;
  lineas: LineaCarrito[];
};

type ContextoCarrito = {
  carrito: Carrito;
  piezas: number;
  subtotal: number;
  cantidadDe: (productoId: string) => number;
  agregar: (negocio: NonNullable<Carrito["negocio"]>, producto: Omit<LineaCarrito, "cantidad">) => boolean;
  cambiar: (productoId: string, cantidad: number) => void;
  vaciar: () => void;
};

const CLAVE = "pideprogreso:carrito";
const VACIO: Carrito = { negocio: null, lineas: [] };

function leer(): Carrito {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) return VACIO;
    const carrito = JSON.parse(guardado) as Carrito;
    // Carritos guardados con una versión anterior no traen las modalidades de entrega.
    if (carrito.negocio && carrito.negocio.aceptaEntrega === undefined) return VACIO;
    return carrito;
  } catch {
    return VACIO;
  }
}

// El carrito vive en localStorage y se comparte entre componentes con useSyncExternalStore.
let enMemoria: Carrito | null = null;
const oyentes = new Set<() => void>();

function actual() {
  return (enMemoria ??= leer());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

function setCarrito(cambio: (actual: Carrito) => Carrito) {
  enMemoria = cambio(actual());
  try {
    localStorage.setItem(CLAVE, JSON.stringify(enMemoria));
  } catch {
    // Sin almacenamiento (modo privado): el carrito vive solo en esta pestaña.
  }
  oyentes.forEach((o) => o());
}

// Cada componente se suscribe por su cuenta: así cada uno se hidrata contra el carrito vacío del servidor.
export function useCarrito(): ContextoCarrito {
  const carrito = useSyncExternalStore(suscribir, actual, () => VACIO);

  const agregar = useCallback<ContextoCarrito["agregar"]>(
    (negocio, producto) => {
      if (
        carrito.negocio &&
        carrito.negocio.id !== negocio.id &&
        carrito.lineas.length > 0 &&
        !window.confirm(
          `Tu pedido tiene productos de ${carrito.negocio.nombre}. ¿Empezar un pedido nuevo en ${negocio.nombre}?`,
        )
      ) {
        return false;
      }
      setCarrito((actual) => {
        const mismo = actual.negocio?.id === negocio.id;
        const lineas = mismo ? actual.lineas : [];
        const existente = lineas.find((l) => l.productoId === producto.productoId);
        return {
          negocio,
          lineas: existente
            ? lineas.map((l) =>
                l.productoId === producto.productoId
                  ? { ...l, cantidad: Math.min(l.cantidad + 1, 99) }
                  : l,
              )
            : [...lineas, { ...producto, cantidad: 1 }],
        };
      });
      return true;
    },
    [carrito],
  );

  const cambiar = useCallback((productoId: string, cantidad: number) => {
    setCarrito((actual) => {
      const lineas =
        cantidad <= 0
          ? actual.lineas.filter((l) => l.productoId !== productoId)
          : actual.lineas.map((l) =>
              l.productoId === productoId ? { ...l, cantidad: Math.min(cantidad, 99) } : l,
            );
      return lineas.length ? { ...actual, lineas } : VACIO;
    });
  }, []);

  const valor = useMemo<ContextoCarrito>(() => {
    const piezas = carrito.lineas.reduce((s, l) => s + l.cantidad, 0);
    const subtotal = carrito.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
    return {
      carrito,
      piezas,
      subtotal,
      cantidadDe: (id) => carrito.lineas.find((l) => l.productoId === id)?.cantidad ?? 0,
      agregar,
      cambiar,
      vaciar: () => setCarrito(() => VACIO),
    };
  }, [carrito, agregar, cambiar]);

  return valor;
}
