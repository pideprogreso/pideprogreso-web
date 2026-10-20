import { ArrowLeft, Bike, Clock, MapPin, ShoppingBag, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotonAgregar } from "@/components/carrito/boton-agregar";
import { Portada } from "@/components/portada";
import { obtenerNegocio } from "@/lib/datos";
import { dinero } from "@/lib/formato";
import type { Producto } from "@/lib/tipos";

export async function generateMetadata({
  params,
}: PageProps<"/negocios/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const datos = await obtenerNegocio(slug);
  return { title: datos?.negocio.nombre ?? "Negocio" };
}

export default function PaginaNegocio({ params }: PageProps<"/negocios/[slug]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido params={params} />
    </Suspense>
  );
}

function agruparPorSeccion(productos: Producto[]) {
  const secciones = new Map<string, Producto[]>();
  for (const p of productos) {
    secciones.set(p.seccion, [...(secciones.get(p.seccion) ?? []), p]);
  }
  return [...secciones.entries()];
}

function anclaDe(seccion: string) {
  return `seccion-${seccion.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}`;
}

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const datos = await obtenerNegocio(slug);
  if (!datos) notFound();

  const { negocio, productos } = datos;
  const secciones = agruparPorSeccion(productos);
  const paraCarrito = {
    id: negocio.id,
    slug: negocio.slug,
    nombre: negocio.nombre,
    costoEnvio: negocio.costoEnvio,
    pedidoMinimo: negocio.pedidoMinimo,
  };

  return (
    <article>
      <div className="relative h-56 md:mt-4 md:h-72 md:overflow-hidden md:rounded-3xl">
        <Portada
          src={negocio.portadaUrl}
          alt={negocio.nombre}
          categoria={negocio.categoria}
          sizes="(min-width: 768px) 1024px, 100vw"
          tamanoIcono="text-8xl"
          prioridad
        />
        <Link
          href="/"
          aria-label="Volver al inicio"
          className="absolute left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] grid size-10 place-items-center rounded-full bg-white text-[#1f1418] shadow-md"
        >
          <ArrowLeft aria-hidden size={20} />
        </Link>
      </div>

      <div className="relative -mt-6 rounded-t-[1.75rem] bg-background px-4 pt-5 md:mt-0 md:px-0">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-tight">
              {negocio.nombre}
            </h1>
            {negocio.descripcion && (
              <p className="mt-1 text-[15px] text-suave">{negocio.descripcion}</p>
            )}
          </div>
          <span
            className={`mt-1.5 shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
              negocio.abierto ? "bg-abierto/10 text-abierto" : "bg-superficie text-suave"
            }`}
          >
            {negocio.abierto ? "Abierto" : "Cerrado"}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-borde rounded-2xl border border-borde text-center">
          <div className="px-2 py-3">
            <dt className="flex items-center justify-center gap-1 text-xs text-suave">
              <Clock aria-hidden size={13} /> Tiempo
            </dt>
            <dd className="mt-0.5 font-semibold">
              {negocio.tiempoMin}–{negocio.tiempoMax} min
            </dd>
          </div>
          <div className="px-2 py-3">
            <dt className="flex items-center justify-center gap-1 text-xs text-suave">
              <Bike aria-hidden size={14} /> Envío
            </dt>
            <dd className="mt-0.5 font-semibold">
              {negocio.aceptaEntrega
                ? negocio.costoEnvio === 0
                  ? "Gratis"
                  : dinero(negocio.costoEnvio)
                : "No"}
            </dd>
          </div>
          <div className="px-2 py-3">
            <dt className="flex items-center justify-center gap-1 text-xs text-suave">
              <ShoppingBag aria-hidden size={13} /> Mínimo
            </dt>
            <dd className="mt-0.5 font-semibold">
              {negocio.pedidoMinimo > 0 ? dinero(negocio.pedidoMinimo) : "Sin mínimo"}
            </dd>
          </div>
        </dl>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-suave">
          {negocio.aceptaRecoger && (
            <li className="inline-flex items-center gap-1.5">
              <Store aria-hidden size={15} /> Puedes recoger en el local
            </li>
          )}
          {negocio.direccion && (
            <li className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden size={15} /> {negocio.direccion}
            </li>
          )}
          {negocio.horario && (
            <li className="inline-flex items-center gap-1.5">
              <Clock aria-hidden size={15} /> {negocio.horario}
            </li>
          )}
        </ul>
      </div>

      {secciones.length > 1 && (
        <nav
          aria-label="Secciones del menú"
          className="sticky top-0 z-20 mt-5 border-b border-borde bg-background/95 backdrop-blur"
        >
          <ul className="carrusel flex gap-2 overflow-x-auto px-4 py-3 md:px-0">
            {secciones.map(([seccion]) => (
              <li key={seccion}>
                <a
                  href={`#${anclaDe(seccion)}`}
                  className="block whitespace-nowrap rounded-full bg-superficie px-4 py-2 text-sm font-semibold hover:bg-vino-50 hover:text-vino-700"
                >
                  {seccion}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {!negocio.abierto && (
        <p className="mx-4 mt-5 rounded-xl bg-superficie px-4 py-3 text-sm md:mx-0">
          Este negocio está cerrado ahora. Puedes ver su menú y pedir cuando abra.
        </p>
      )}

      <div className="px-4 md:px-0">
        {secciones.length === 0 && (
          <p className="mt-10 text-center text-suave">Este negocio todavía no sube su menú.</p>
        )}
        {secciones.map(([seccion, lista]) => (
          <section key={seccion} id={anclaDe(seccion)} className="scroll-mt-20 pt-6">
            <h2 className="font-display text-xl font-bold tracking-tight">{seccion}</h2>
            <ul className="mt-2 divide-y divide-borde md:grid md:grid-cols-2 md:gap-x-8 md:divide-y-0">
              {lista.map((p) => (
                <li key={p.id} className="flex gap-4 py-4 md:border-b md:border-borde">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{p.nombre}</h3>
                    {p.descripcion && (
                      <p className="mt-1 line-clamp-2 text-sm text-suave">{p.descripcion}</p>
                    )}
                    <p className="mt-2 font-semibold">{dinero(p.precio)}</p>
                  </div>
                  <div className="relative size-28 shrink-0">
                    <div className="relative size-full overflow-hidden rounded-2xl">
                      <Portada
                        src={p.imagenUrl}
                        alt={p.nombre}
                        categoria={negocio.categoria}
                        sizes="112px"
                        tamanoIcono="text-4xl"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <BotonAgregar
                        negocio={paraCarrito}
                        producto={{ productoId: p.id, nombre: p.nombre, precio: p.precio }}
                        deshabilitado={!negocio.abierto}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-8 px-4 text-center text-xs text-suave md:px-0">
        Pagas en efectivo o por transferencia.
      </p>
    </article>
  );
}

function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando negocio">
      <div className="h-56 animate-pulse bg-superficie" />
      <div className="space-y-3 px-4 pt-6">
        <div className="h-7 w-2/3 animate-pulse rounded-lg bg-superficie" />
        <div className="h-4 w-full animate-pulse rounded bg-superficie" />
        <div className="h-16 animate-pulse rounded-2xl bg-superficie" />
      </div>
    </div>
  );
}
