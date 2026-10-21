import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioNegocio } from "@/components/formulario-negocio";
import { requerirNegocio } from "@/lib/panel";

export const metadata: Metadata = { title: "Mi negocio" };

export default function PaginaNegocio() {
  return (
    <div className="mx-auto max-w-2xl pt-6 md:pt-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-superficie" />}>
        <Datos />
      </Suspense>
    </div>
  );
}

async function Datos() {
  const n = await requerirNegocio("/panel/negocio");
  return (
    <FormularioNegocio
      negocioId={n.id}
      inicial={{
        nombre: n.nombre,
        categoria: n.categoria ?? "",
        descripcion: n.descripcion ?? "",
        telefono: n.telefono ?? "",
        whatsapp: n.whatsapp ?? "",
        direccion: n.direccion ?? "",
        horario: n.horario ?? "",
        aceptaEntrega: n.aceptaEntrega,
        aceptaRecoger: n.aceptaRecoger,
        costoEnvio: n.costoEnvio,
        pedidoMinimo: n.pedidoMinimo,
        tiempoMin: n.tiempoMin,
        tiempoMax: n.tiempoMax,
        datosTransferencia: n.datosTransferencia ?? "",
        portadaUrl: n.portadaUrl,
        logoUrl: n.logoUrl,
      }}
    />
  );
}
