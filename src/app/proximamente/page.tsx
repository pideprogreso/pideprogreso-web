import { Check as IconoCheck, ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { FormularioInteresado } from "./formulario";

export const metadata: Metadata = {
  title: { absolute: "PideProgreso · Muy pronto en Nuevo Progreso" },
  description:
    "Muy pronto la gente de Nuevo Progreso va a pedir desde su celular a los negocios de aquí. Aparta tu lugar de fundador.",
};

const GIROS = [
  { nombre: "Taquerías", foto: "/demo/tacos.jpg" },
  { nombre: "Panaderías", foto: "/demo/pan.jpg" },
  { nombre: "Pizzerías", foto: "/demo/pizza-2.jpg" },
  { nombre: "Florerías", foto: "/demo/flores.jpg" },
  { nombre: "Abarrotes", foto: "/demo/super.jpg" },
  { nombre: "Hamburguesas", foto: "/demo/hamburguesa-doble.jpg" },
  { nombre: "Pasteles", foto: "/demo/pastel.jpg" },
  { nombre: "Aguas frescas", foto: "/demo/agua-fresca.jpg" },
];

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
    <main className="overflow-x-clip bg-vino-900 text-[17px] text-white selection:bg-dorado-300 selection:text-vino-900 [&_.oscuro_:focus-visible]:outline-dorado-300">
      <section className="oscuro relative">
        <Image src="/demo/tacos.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-vino-900/90" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <header className="flex h-16 items-center justify-between md:h-20">
            <Logo />
            <a href="#registro" className="inline-flex h-10 items-center rounded-full bg-white/10 px-4 text-sm font-semibold hover:bg-white/20">
              Apartar mi lugar
            </a>
          </header>

          <div className="grid items-center gap-12 pt-8 pb-16 lg:grid-cols-[1fr_340px] lg:gap-16 lg:pt-14 lg:pb-24">
            <div>
              <h1 className="entra font-display text-[40px] font-extrabold leading-[0.95] tracking-[-0.035em] md:text-[72px]">
                <span className="block">Suena tu celular.</span>
                <span className="block">Es otro pedido.</span>
              </h1>
              <p className="entra mt-8 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
                Imagínalo: muy pronto la gente de Nuevo Progreso va a pedir desde su celular a los negocios de aquí.
                La pregunta es si el tuyo va a estar ahí cuando lo busquen.
              </p>
              <div className="entra mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#registro"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-dorado-300 px-7 text-lg font-bold text-vino-900 transition-transform hover:bg-dorado-400 active:scale-[0.98]"
                >
                  Quiero estar desde el inicio
                </a>
                <span className="text-center text-sm text-white/70 sm:ml-2">Toma 30 segundos · Sin compromiso</span>
              </div>
            </div>
            <Celular />
          </div>
        </div>
      </section>

      <section aria-labelledby="giros" className="bg-vino-800 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 id="giros" className="entra font-display text-[32px] font-extrabold leading-[1] tracking-[-0.03em] md:text-[48px]">
            Todo Progreso, en una app.
          </h2>
          <p className="entra mt-4 max-w-xl text-white/80">
            Tacos, pan, pizza, flores, súper. Lo que la gente ya compra aquí, ahora también desde su casa.
          </p>
        </div>
        <div className="mx-4 mt-10 overflow-hidden rounded-3xl md:mx-8">
          <ul className="cinta flex w-max gap-3">
            {[...GIROS, ...GIROS].map((g, i) => (
              <li key={i} aria-hidden={i >= GIROS.length} className="relative h-56 w-44 shrink-0 overflow-hidden rounded-3xl md:h-72 md:w-56">
                <Image src={g.foto} alt={g.nombre} fill sizes="224px" className="object-cover" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-sm font-bold text-vino-900">{g.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="oscuro mx-auto max-w-6xl px-4 py-24 md:px-8 md:py-36">
        <h2 className="entra font-display text-[32px] font-extrabold leading-[1] tracking-[-0.03em] md:text-[48px]">
          Aquí no te quitan el 30%.
        </h2>
        <p className="entra mt-4 max-w-xl text-white/80">
          Las apps grandes se quedan hasta con 30% de cada venta. En PideProgreso pagas una cuota fija al mes y lo
          que vendes es tuyo, completo.
        </p>
        <dl className="mt-12 grid gap-10 rounded-3xl bg-vino-800 p-6 md:p-10 lg:grid-cols-3">
          <Dato numero="0%" titulo="de comisión por pedido">
            Vendas 10 pedidos o 300, la cuota es la misma.
          </Dato>
          <Dato numero="24/7" titulo="tu menú a la vista">
            Fotos, precios y horario. Te encuentran aunque tengas la cortina abajo.
          </Dato>
          <Dato numero="1 toque" titulo="para aceptar un pedido">
            Te llega al celular, lo aceptas y le avisas al cliente cuando está listo.
          </Dato>
        </dl>
      </section>

      <section className="bg-dorado-300 text-vino-900">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 md:px-8 md:py-36 lg:grid-cols-[340px_1fr] lg:gap-20">
          <div className="lg:order-2">
            <h2 className="entra font-display text-[34px] font-extrabold leading-[1] tracking-[-0.03em] md:text-[52px]">
              Hay antojo y nadie quiere salir.
            </h2>
            <p className="entra mt-5 max-w-xl text-lg">
              Así lo van a vivir tus clientes: abren PideProgreso, ven tu menú con fotos y piden en tres toques. Sin
              llamadas, sin “¿me repites?”, sin pedidos perdidos.
            </p>
            <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              <Ventaja titulo="Ven todo antes de pedir">Fotos, precios y cuánto tarda.</Ventaja>
              <Ventaja titulo="Pagan como prefieren">Efectivo o transferencia.</Ventaja>
              <Ventaja titulo="Saben en qué va">Recibido, preparando, en camino.</Ventaja>
              <Ventaja titulo="Vuelven a pedir">Tu negocio queda a un toque.</Ventaja>
            </ul>
          </div>
          <CelularCliente />
        </div>
      </section>

      <section id="registro" className="scroll-mt-4 bg-white text-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 md:px-8 md:py-36 lg:grid-cols-[1fr_440px] lg:gap-16">
          <div className="lg:pt-6">
            <h2 className="entra font-display text-[34px] font-extrabold leading-[1] tracking-[-0.03em] md:text-[52px]">
              Aparta tu lugar de fundador.
            </h2>
            <p className="entra mt-5 max-w-md text-lg">
              Es solo para los primeros: los negocios que se registren antes de abrir entran con un precio especial
              que no vamos a anunciar en ningún lado. Déjanos tus datos y te lo mandamos por WhatsApp, junto con cómo
              trabajamos.
            </p>
            <ul className="mt-8 space-y-3">
              <Check>Precio de fundador mientras sigas con nosotros</Check>
              <Check>Te ayudamos a subir tu menú y tus fotos</Check>
              <Check>Sales en la app desde el primer día</Check>
            </ul>
          </div>
          <div className="rounded-3xl bg-superficie p-5 md:p-8">
            <FormularioInteresado />
          </div>
        </div>
      </section>

      <section aria-labelledby="preguntas" className="bg-white text-foreground">
        <div className="mx-auto max-w-3xl px-4 pb-24 md:px-8 md:pb-36">
          <h2 id="preguntas" className="entra font-display text-[34px] font-extrabold tracking-[-0.03em] md:text-[52px]">
            Lo que todos preguntan
          </h2>
          <div className="mt-8 space-y-2">
            {PREGUNTAS.map(({ p, r }) => (
              <details key={p} className="group rounded-2xl bg-superficie px-5 py-4 open:bg-superficie-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {p}
                  <ChevronDown aria-hidden size={20} className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="oscuro mx-auto max-w-6xl px-4 pt-16 pb-10 md:px-8">
        <p aria-hidden className="font-display text-[15vw] font-extrabold leading-[0.85] tracking-[-0.05em] lg:text-[180px]">
          pide<span className="text-dorado-300">progreso</span>
        </p>
        <p className="mt-6 text-white/70">Hecho en Nuevo Progreso, Tamps. · Muy pronto en tu celular.</p>
      </footer>
    </main>
  );
}

function Celular() {
  return (
    <div data-ui aria-hidden className="relative mx-auto w-full max-w-[320px]">
      <div className="relative rounded-[44px] bg-black p-2.5">
        <div className="relative h-[500px] overflow-hidden rounded-[36px]">
          <Image src="/demo/pizza.jpg" alt="" fill sizes="320px" className="object-cover blur-[2px] brightness-50" />
          <div className="absolute top-2.5 left-1/2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="relative px-4 pt-14 text-center font-display font-bold">
            <span className="block text-sm text-white/80">viernes</span>
            <span className="block text-7xl tracking-tight">8:47</span>
          </div>
          <ul className="relative mt-8 space-y-2.5 px-3">
            {AVISOS.map((a, i) => (
              <li
                key={a.texto}
                className="aviso flex gap-3 rounded-2xl bg-white p-3 text-foreground"
                style={{ animationDelay: `${0.5 + (AVISOS.length - 1 - i) * 0.9}s` }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-vino-700 font-display text-lg font-extrabold text-white">
                  p
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex justify-between text-xs text-suave">
                    <span className="font-semibold">PideProgreso</span>
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

function CelularCliente() {
  return (
    <div data-ui aria-hidden className="relative mx-auto w-full max-w-[320px] lg:order-1">
      <div className="relative rounded-[44px] bg-black p-2.5">
        <div className="relative h-[560px] overflow-hidden rounded-[36px] bg-white text-foreground">
          <div className="absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="relative h-44">
            <Image src="/demo/tacos.jpg" alt="" fill sizes="320px" className="object-cover" />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute bottom-3 left-4 text-white">
              <span className="block font-display text-xl font-extrabold">Taquería de la esquina</span>
              <span className="block text-xs text-white/90">Abierto · 20–30 min · Envío gratis</span>
            </div>
          </div>
          <div className="space-y-2 p-3">
            {[
              { nombre: "Tacos de pastor (4)", precio: "$60", foto: "/demo/tacos-2.jpg", cuantos: 1 },
              { nombre: "Agua de jamaica", precio: "$28", foto: "/demo/agua-fresca.jpg", cuantos: 2 },
            ].map((p) => (
              <div key={p.nombre} className="flex items-center gap-3 rounded-2xl bg-superficie p-1.5">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.foto} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{p.nombre}</span>
                  <span className="block text-sm text-suave">{p.precio}</span>
                </span>
                <span className="mr-1 grid size-7 place-items-center rounded-full bg-vino-700 text-xs font-bold text-white">
                  {p.cuantos}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-3 bottom-3 rounded-3xl bg-vino-50 p-4">
            <span className="block text-sm text-suave">Tu pedido</span>
            <div className="relative mt-1 h-7">
              {["Recibido por el negocio", "Preparando tu pedido", "¡Va en camino!"].map((e, i) => (
                <span key={e} className="paso absolute inset-0 font-display text-lg font-extrabold" style={{ animationDelay: `${i * 3}s` }}>
                  {e}
                </span>
              ))}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="barra h-full rounded-full bg-vino-700" />
            </div>
            <div className="mt-4 flex h-12 items-center justify-between rounded-full bg-vino-700 px-5 text-sm font-semibold text-white">
              <span>3 productos</span>
              <span>$116</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ventaja({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <li className="entra">
      <span className="block text-lg font-bold">{titulo}</span>
      <span className="block">{children}</span>
    </li>
  );
}

function Dato({ numero, titulo, children }: { numero: string; titulo: string; children: React.ReactNode }) {
  return (
    <div className="entra">
      <dt>
        <span className="block font-display text-6xl font-extrabold tracking-[-0.03em] text-dorado-300">{numero}</span>
        <span className="mt-2 block text-lg font-semibold">{titulo}</span>
      </dt>
      <dd className="mt-3 text-white/80">{children}</dd>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-vino-700 text-white">
        <IconoCheck aria-hidden size={14} strokeWidth={3} />
      </span>
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
