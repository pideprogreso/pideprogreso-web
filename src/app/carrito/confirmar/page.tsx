import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AceptacionLegal } from "@/components/aceptacion-legal";
import { BotonGoogle } from "@/components/boton-google";
import { obtenerDatosCliente } from "@/lib/cliente";
import { FormularioConfirmar } from "./formulario";

export const metadata: Metadata = { title: "Confirmar pedido" };

export default function PaginaConfirmar() {
  return (
    <Suspense fallback={<div className="mx-auto mt-10 h-96 max-w-5xl animate-pulse rounded-3xl bg-superficie" />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const cliente = await obtenerDatosCliente();
  if (cliente) return <FormularioConfirmar cliente={cliente} />;

  // Sin cuenta: el carrito sigue guardado en el celular mientras entra.
  return (
    <div className="mx-auto max-w-md px-4 pt-10 text-center md:pt-16">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-vino-50 text-vino-700">
        <ShoppingBag aria-hidden size={28} />
      </span>
      <h1 className="mt-4 font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
        Entra para enviar tu pedido
      </h1>
      <p className="mx-auto mt-2 max-w-xs text-suave">
        Así el negocio sabe quién pide y a dónde llevarlo. Tu pedido se queda guardado.
      </p>
      <div className="mt-8 space-y-3 text-left">
        <BotonGoogle siguiente="/carrito/confirmar" />
        <Link
          href="/entrar?siguiente=/carrito/confirmar"
          className="flex h-14 items-center justify-center rounded-full border border-borde font-semibold hover:bg-superficie"
        >
          Usar mi correo
        </Link>
        <AceptacionLegal accion="continuar" className="text-center" />
      </div>
    </div>
  );
}
