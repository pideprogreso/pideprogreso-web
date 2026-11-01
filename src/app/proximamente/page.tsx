import { BellRing, ChevronDown, Clock, Percent } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { FormularioInteresado } from "./formulario";

export const metadata: Metadata = {
  title: { absolute: "PideProgreso · Muy pronto en Nuevo Progreso" },
  description:
    "Muy pronto la gente de Nuevo Progreso va a pedir desde su celular a los negocios de aquí. Aparta tu lugar de fundador.",
};

const GIROS = ["Taquerías", "Panaderías", "Pizzerías", "Florerías", "Abarrotes", "Hamburguesas", "Pasteles", "Antojitos", "Tiendas", "Aguas frescas"];

const AVISOS = [
  { cuando: "ahora", texto: "4 tacos de pastor + 2 aguas", total: "$148" },
  { cuando: "hace 3 min", texto: "Pizza grande de pepperoni", total: "$210" },
  { cuando: "hace 8 min", texto: "Media docena de pan dulce", total: "$72" },
];

const PREGUNTAS = [
  {
    p: "¿Cuánto cuesta?",
    r: "Una cuota fija al mes, sin comisión por pedido. Los negocios que se registren ahora entran con precio de fundador. Te mandamos los números por WhatsApp.",
  },
  {
    p: "¿Necesito saber de computadoras?",
    r: "No. Todo se maneja desde tu celular: subes tu menú una vez y los pedidos te llegan como notificación. Te ayudamos a dejarlo listo.",
  },
  {
    p: "¿Quién hace las entregas?",
    r: "Tú decides: entregas con tu propio repartidor, el cliente pasa a recoger, o las dos.",
  },
  {
    p: "¿Cuándo abren?",
    r: "Muy pronto. Los negocios registrados se enteran primero y salen en la app desde el primer día.",
  },
];

// Página sola, sin enlaces al resto de la app: es lo único que se ve en el dominio antes de abrir.
export default function PaginaProximamente() {
  return (
    <main className="overflow-x-clip bg-vino-900 text-white">
      <section className="relative">
        <Image src="/demo/tacos.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-vino-900/70 via-vino-900/90 to-vino-900" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <header className="flex h-16 items-center justify-between md:h-20">
            <Logo />
            <a
              href="#registro"
              className="inline-flex h-10 items-center rounded-full bg-white/10 px-4 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/20"
            >
              Apartar mi lugar
            </a>
          </header>

          <div className="grid items-center gap-12 pt-8 pb-16 md:grid-cols-[1fr_360px] md:gap-16 md:pt-14 md:pb-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-dorado-300/15 px-3 py-1.5 text-sm font-semibold text-dorado-300 ring-1 ring-dorado-300/30">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-dorado-300 motion-reduce:hidden" />
                  <span className="relative size-2 rounded-full bg-dorado-300" />
                </span>
                Para negocios de Nuevo Progreso
              </p>
              <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[0.95] tracking-[-0.035em] md:text-[68px]">
                Imagina que suena tu celular… <span className="text-dorado-300">y es otro pedido.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/80 md:text-xl">
                Muy pronto, la gente de Progreso va a pedir desde su celular a los negocios de aquí. La pregunta es
                si el tuyo va a estar ahí cuando lo busquen.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#registro"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-dorado-300 px-7 text-[17px] font-bold text-vino-900 shadow-[0_10px_40px_-8px_rgb(242_182_50/0.6)] hover:bg-dorado-400"
                >
                  Quiero estar desde el inicio
                </a>
                <span className="text-center text-sm text-white/60 sm:ml-2">Toma 30 segundos · Sin compromiso</span>
              </div>
            </div>
            <Celular />
          </div>
        </div>
      </section>

      <div aria-hidden className="overflow-hidden border-y border-white/10 bg-vino-800 py-4">
        <div className="cinta flex w-max gap-8 font-display text-xl font-bold text-white/40">
          {[...GIROS, ...GIROS].map((g, i) => (
            <span key={i} className="flex items-center gap-8">
              {g} <span className="text-dorado-300">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
        <h2 className="max-w-2xl font-display text-[32px] font-extrabold leading-[1.02] tracking-[-0.03em] md:text-[48px]">
          Las apps grandes se quedan hasta con <span className="text-dorado-300">30%</span> de cada venta.
          <span className="text-white/50"> Aquí no.</span>
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Dato icono={<Percent aria-hidden size={22} />} numero="0%" titulo="de comisión por pedido">
            Pagas una cuota fija al mes. Lo que vendes es tuyo, completo.
          </Dato>
          <Dato icono={<Clock aria-hidden size={22} />} numero="24/7" titulo="tu menú a la vista">
            Fotos, precios y horario. Te encuentran aunque tengas la cortina abajo.
          </Dato>
          <Dato icono={<BellRing aria-hidden size={22} />} numero="1 toque" titulo="para aceptar un pedido">
            Te llega al celular, lo aceptas y le avisas al cliente cuando está listo.
          </Dato>
        </div>
      </section>

      <section id="registro" className="scroll-mt-4 bg-white text-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1fr_440px] md:gap-16 md:px-8 md:py-24">
          <div className="md:pt-6">
            <p className="inline-flex rounded-full bg-dorado-100 px-3 py-1 text-sm font-bold text-dorado-800">Solo para los primeros</p>
            <h2 className="mt-4 font-display text-[34px] font-extrabold leading-[1] tracking-[-0.03em] md:text-[52px]">
              Aparta tu lugar de <span className="text-vino-700">fundador.</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-suave">
              Los negocios que se registren antes de abrir entran con un precio especial que no vamos a anunciar en
              ningún lado. Déjanos tus datos y te lo mandamos por WhatsApp, junto con cómo trabajamos.
            </p>
            <ul className="mt-8 space-y-3 text-[15px]">
              <Check>Precio de fundador mientras sigas con nosotros</Check>
              <Check>Te ayudamos a subir tu menú y tus fotos</Check>
              <Check>Sales en la app desde el primer día</Check>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-[0_24px_80px_-20px_rgb(58_6_23/0.35)] ring-1 ring-borde md:p-8">
            <FormularioInteresado />
          </div>
        </div>
      </section>

      <section className="bg-white text-foreground">
        <div className="mx-auto max-w-3xl px-4 pb-20 md:px-8 md:pb-28">
          <h2 className="font-display text-[28px] font-extrabold tracking-[-0.02em]">Lo que todos preguntan</h2>
          <div className="mt-6 divide-y divide-borde border-y border-borde">
            {PREGUNTAS.map(({ p, r }) => (
              <details key={p} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {p}
                  <ChevronDown aria-hidden size={20} className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-suave">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <Logo />
        <p className="text-sm text-white/50">Hecho en Nuevo Progreso, Tamps. · Muy pronto en tu celular.</p>
      </footer>
    </main>
  );
}

function Celular() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[330px]">
      <div className="absolute -inset-10 rounded-full bg-dorado-400/20 blur-3xl" />
      <div className="relative rounded-[44px] bg-black p-2.5 shadow-2xl ring-1 ring-white/15">
        <div className="relative h-[500px] overflow-hidden rounded-[36px]">
          <Image src="/demo/pizza.jpg" alt="" fill sizes="330px" className="object-cover blur-[2px] brightness-50" />
          <div className="absolute top-2.5 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="relative px-4 pt-14 text-center">
            <p className="text-sm font-medium text-white/80">viernes</p>
            <p className="font-display text-7xl font-bold tracking-tight">8:47</p>
          </div>
          <ul className="relative mt-8 space-y-2.5 px-3">
            {AVISOS.map((a, i) => (
              <li
                key={a.texto}
                className="aviso flex gap-3 rounded-2xl bg-white/85 p-3 text-foreground backdrop-blur-md"
                style={{ animationDelay: `${0.5 + (AVISOS.length - 1 - i) * 0.9}s` }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-vino-700 font-display text-lg font-extrabold text-white">
                  p
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex justify-between text-xs text-suave">
                    <span className="font-semibold uppercase tracking-wide">PideProgreso</span>
                    {a.cuando}
                  </span>
                  <span className="block text-sm font-bold">¡Nuevo pedido! · {a.total}</span>
                  <span className="block truncate text-sm text-suave">{a.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Dato({ icono, numero, titulo, children }: { icono: React.ReactNode; numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 md:p-8">
      <span className="grid size-11 place-items-center rounded-xl bg-dorado-300/15 text-dorado-300">{icono}</span>
      <p className="mt-6 font-display text-5xl font-extrabold tracking-[-0.03em]">{numero}</p>
      <p className="mt-1 font-semibold text-white/90">{titulo}</p>
      <p className="mt-3 text-white/60">{children}</p>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-vino-700 text-xs font-bold text-white">✓</span>
      {children}
    </li>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="relative grid size-9 place-items-center rounded-[11px] bg-white font-display text-[22px] font-extrabold leading-none text-vino-700">
        <span className="-mt-1">p</span>
        <span className="absolute right-[7px] top-[7px] size-[7px] rounded-full bg-dorado-400" />
      </span>
      <span className="font-display text-[21px] font-extrabold tracking-[-0.03em]">
        pide<span className="text-dorado-300">progreso</span>
      </span>
    </span>
  );
}
