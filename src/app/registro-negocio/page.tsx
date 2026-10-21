import { BellRing, ClipboardList, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BotonGoogle } from "@/components/boton-google";
import { FormularioNegocio, NEGOCIO_VACIO } from "@/components/formulario-negocio";
import { obtenerMiNegocio } from "@/lib/panel";
import { obtenerUsuario } from "@/lib/sesion";

export const metadata: Metadata = { title: "Registrar mi negocio" };

export default function PaginaRegistro() {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8">
      <Suspense fallback={<div className="mt-10 h-96 animate-pulse rounded-3xl bg-superficie" />}>
        <Contenido />
      </Suspense>
    </div>
  );
}

async function Contenido() {
  const usuario = await obtenerUsuario();

  if (!usuario || usuario.anonimo) {
    return (
      <div className="pt-6 md:pt-10">
        <p className="text-sm font-bold uppercase tracking-wider text-vino-700">Para negocios</p>
        <h1 className="mt-1 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] md:text-[44px]">
          Vende en PideProgreso
        </h1>
        <p className="mt-3 max-w-md text-lg text-suave">
          Tus clientes de Nuevo Progreso te encuentran, ven tu menú y te piden desde su celular.
        </p>
        <ol className="mt-8 space-y-5">
          <Paso icono={<Store aria-hidden size={22} />} titulo="Registra tu negocio" detalle="Nombre, dirección, horario y cómo entregas. Toma 3 minutos." />
          <Paso icono={<ClipboardList aria-hidden size={22} />} titulo="Sube tu menú" detalle="Productos, precios y fotos. Puedes cambiarlo cuando quieras." />
          <Paso icono={<BellRing aria-hidden size={22} />} titulo="Recibe pedidos" detalle="Te suena el celular, aceptas y le avisas al cliente cuando está listo." />
        </ol>
        <div className="mt-8 max-w-sm space-y-3">
          <BotonGoogle siguiente="/registro-negocio" />
          <Link
            href="/entrar?modo=crear&siguiente=/registro-negocio"
            className="flex h-14 items-center justify-center rounded-full border border-borde font-semibold hover:bg-superficie"
          >
            Usar mi correo
          </Link>
        </div>
      </div>
    );
  }

  if (await obtenerMiNegocio()) redirect("/panel");

  return (
    <div className="pt-6 md:pt-10">
      <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] md:text-[36px]">
        Registra tu negocio
      </h1>
      <p className="mt-1 text-suave">
        Revisamos tu solicitud y te avisamos cuando tu negocio aparezca en PideProgreso. Mientras, ya puedes
        subir tu menú.
      </p>
      <div className="mt-8">
        <FormularioNegocio inicial={NEGOCIO_VACIO} negocioId={null} />
      </div>
    </div>
  );
}

function Paso({ icono, titulo, detalle }: { icono: React.ReactNode; titulo: string; detalle: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-vino-50 text-vino-700">{icono}</span>
      <span>
        <span className="block font-semibold">{titulo}</span>
        <span className="block text-suave">{detalle}</span>
      </span>
    </li>
  );
}
