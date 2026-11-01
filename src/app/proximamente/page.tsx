import { BellRing, Smartphone, Store } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { FormularioInteresado } from "./formulario";

export const metadata: Metadata = {
  title: { absolute: "PideProgreso · Muy pronto en Nuevo Progreso" },
  description: "PideProgreso llega pronto a Nuevo Progreso. Registra tu negocio y te mandamos el costo y cómo trabajamos.",
};

// Página sola, sin enlaces al resto de la app: es lo único que se ve en el dominio antes de abrir.
export default function PaginaProximamente() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-vino-900 text-white">
      <Image src="/demo/mesa.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-vino-900 via-vino-900/85 to-black/60" />
      <div className="relative mx-auto grid min-h-dvh max-w-7xl gap-8 px-4 py-6 md:grid-cols-[1fr_420px] md:gap-12 md:px-8 md:py-12">
        <div className="md:self-center">
          <Logo />
          <span className="mt-10 inline-flex h-8 items-center rounded-full bg-dorado-300 px-3 text-sm font-bold text-vino-900 md:mt-14">
            Muy pronto
          </span>
          <h1 className="mt-4 font-display text-[36px] font-extrabold leading-[0.98] tracking-[-0.03em] md:text-[60px]">
            Tu negocio, en el celular de todo Progreso.
          </h1>
          <p className="mt-4 max-w-md text-[15px] text-white/85 md:text-lg">
            Estamos por abrir PideProgreso, la app para pedir a los negocios de aquí. Déjanos tus datos y te
            mandamos el costo de la suscripción y cómo trabajamos.
          </p>
          <ul className="mt-8 space-y-4">
            <Beneficio icono={<Store aria-hidden size={20} />} texto="Tu menú con fotos y precios, siempre al día." />
            <Beneficio icono={<BellRing aria-hidden size={20} />} texto="Pedidos directo a tu celular, sin comisión por venta." />
            <Beneficio icono={<Smartphone aria-hidden size={20} />} texto="Tú decides si entregas o el cliente recoge." />
          </ul>
        </div>
        <div className="self-center rounded-3xl bg-white p-5 text-foreground shadow-2xl md:p-7">
          <h2 className="font-display text-xl font-extrabold tracking-[-0.02em]">Quiero vender en PideProgreso</h2>
          <p className="mt-1 mb-5 text-sm text-suave">Te contactamos antes de abrir.</p>
          <FormularioInteresado />
        </div>
        <p className="text-sm text-white/60 md:col-span-2">© PideProgreso · Nuevo Progreso, Tamps.</p>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="relative grid size-10 place-items-center rounded-[12px] bg-white font-display text-[24px] font-extrabold leading-none text-vino-700">
        <span className="-mt-1">p</span>
        <span className="absolute right-[8px] top-[8px] size-[7px] rounded-full bg-dorado-400" />
      </span>
      <span className="font-display text-[23px] font-extrabold tracking-[-0.03em]">
        pide<span className="text-dorado-300">progreso</span>
      </span>
    </span>
  );
}

function Beneficio({ icono, texto }: { icono: React.ReactNode; texto: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-dorado-300">{icono}</span>
      <span className="text-white/90">{texto}</span>
    </li>
  );
}
