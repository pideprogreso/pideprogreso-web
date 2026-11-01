import { BellRing, Smartphone, Store } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { FormularioInteresado } from "./formulario";

export const metadata: Metadata = {
  title: "Próximamente",
  description: "PideProgreso llega pronto a Nuevo Progreso. Registra tu negocio y te mandamos el costo y cómo trabajamos.",
};

export default function PaginaProximamente() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="relative mt-1 overflow-hidden rounded-3xl bg-vino-900 text-white md:mt-8">
        <Image src="/demo/mesa.jpg" alt="" fill priority sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-vino-900 via-vino-900/85 to-black/60" />
        <div className="relative grid gap-8 p-5 py-8 md:grid-cols-[1fr_420px] md:gap-12 md:p-12">
          <div className="md:self-center">
            <span className="inline-flex h-8 items-center rounded-full bg-dorado-300 px-3 text-sm font-bold text-vino-900">
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
          <div className="rounded-3xl bg-white p-5 text-foreground shadow-2xl md:p-7">
            <h2 className="font-display text-xl font-extrabold tracking-[-0.02em]">Quiero vender en PideProgreso</h2>
            <p className="mt-1 mb-5 text-sm text-suave">Te contactamos antes de abrir.</p>
            <FormularioInteresado />
          </div>
        </div>
      </section>
    </div>
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
