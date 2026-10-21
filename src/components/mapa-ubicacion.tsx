"use client";

import "leaflet/dist/leaflet.css";
import type { Map as MapaLeaflet } from "leaflet";
import { Check, LoaderCircle, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Ubicacion = { lat: number; lng: number };

// Centro de Nuevo Progreso, Tamps.
const CENTRO: Ubicacion = { lat: 26.0586, lng: -97.9533 };

// El pin queda fijo al centro y la persona mueve el mapa, como en las apps de delivery.
export function MapaUbicacion({
  valor,
  onCambio,
}: {
  valor: Ubicacion | null;
  onCambio: (u: Ubicacion) => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const alCambiar = useRef(onCambio);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    alCambiar.current = onCambio;
  });

  useEffect(() => {
    let cancelado = false;
    void import("leaflet").then((L) => {
      if (cancelado || !caja.current || mapa.current) return;
      const inicio = valor ?? CENTRO;
      const m = L.map(caja.current, { zoomControl: false, attributionControl: true }).setView(
        [inicio.lat, inicio.lng],
        valor ? 17 : 14,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);
      L.control.zoom({ position: "bottomright" }).addTo(m);
      // Solo cuenta cuando la persona mueve el mapa (no el centro por defecto).
      m.on("dragend zoomend", () => {
        const c = m.getCenter();
        alCambiar.current({ lat: Number(c.lat.toFixed(6)), lng: Number(c.lng.toFixed(6)) });
      });
      mapa.current = m;
    });
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
    };
    // El mapa se crea una sola vez; los cambios llegan por los eventos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function miUbicacion() {
    if (!navigator.geolocation) return setAviso("Tu celular no permite compartir la ubicación.");
    setBuscando(true);
    setAviso(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false);
        const u = { lat: Number(pos.coords.latitude.toFixed(6)), lng: Number(pos.coords.longitude.toFixed(6)) };
        mapa.current?.setView([u.lat, u.lng], 18);
        onCambio(u);
      },
      () => {
        setBuscando(false);
        setAviso("No pudimos obtener tu ubicación. Mueve el mapa hasta tu casa.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  return (
    <div>
      <div className="relative isolate h-64 overflow-hidden rounded-2xl border border-borde bg-superficie md:h-72">
        <div ref={caja} className="absolute inset-0 z-0" />
        <MapPin
          aria-hidden
          size={40}
          strokeWidth={2.2}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full fill-vino-700 text-white drop-shadow-md"
        />
        <button
          type="button"
          onClick={miUbicacion}
          disabled={buscando}
          className="absolute left-3 top-3 z-[500] inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold shadow-flotante disabled:opacity-70"
        >
          {buscando ? <LoaderCircle aria-hidden size={18} className="animate-spin" /> : <LocateFixed aria-hidden size={18} />}
          Usar mi ubicación
        </button>
      </div>
      <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${valor ? "font-semibold text-abierto" : "text-suave"}`}>
        {valor && <Check aria-hidden size={14} />}
        {aviso ?? (valor ? "Ubicación marcada. Puedes moverla si no quedó exacta." : "Mueve el mapa para dejar el pin en tu casa.")}
      </p>
    </div>
  );
}
