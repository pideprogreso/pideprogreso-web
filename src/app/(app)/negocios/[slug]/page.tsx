import { ArrowLeft, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotonAgregar } from "@/components/carrito/boton-agregar";
import { ResumenLateral } from "@/components/carrito/resumen-lateral";
import { FotoNegocio, iniciales } from "@/components/foto";
import { obtenerNegocio } from "@/lib/datos";
import { dinero } from "@/lib/formato";
import type { Negocio, Producto } from "@/lib/tipos";

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
  return `seccion-${seccion
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")}`;
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
    aceptaEntrega: negocio.aceptaEntrega,
    aceptaRecoger: negocio.aceptaRecoger,
  };

  return (
    <article className="mx-auto max-w-7xl md:px-8">
      <div className="relative h-56 overflow-hidden bg-superficie [container-type:inline-size] md:mt-6 md:h-[320px] md:rounded-3xl">
        <FotoNegocio
          src={negocio.portadaUrl}
          nombre={negocio.nombre}
          sizes="(min-width: 1280px) 1216px, 100vw"
          prioridad
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Link
          href="/negocios"
          aria-label="Volver a los negocios"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-white shadow-md hover:bg-superficie"
        >
          <ArrowLeft aria-hidden size={20} />
        </Link>
      </div>

      <div className="px-4 md:px-0">
        <Logo negocio={negocio} />

        <div className="mt-3 flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0 max-w-2xl">
            <h1 className="font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] md:text-[44px]">
              {negocio.nombre}
            </h1>
            {negocio.descripcion && (
              <p className="mt-2 text-[15px] text-suave md:text-base">{negocio.descripcion}</p>
            )}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-suave">
              <li className={`font-semibold ${negocio.abierto ? "text-abierto" : "text-vino-700"}`}>
                {negocio.abierto ? "Abierto ahora" : "Cerrado ahora"}
              </li>
              {negocio.horario && (
                <li className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden size={14} />
                  {negocio.horario}
                </li>
              )}
              {negocio.direccion && (
                <li className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden size={14} />
                  {negocio.direccion}
                </li>
              )}
            </ul>
          </div>

          <dl className="flex w-full divide-x divide-borde rounded-2xl border border-borde md:w-auto">
            <Dato titulo="Entrega" valor={`${negocio.tiempoMin}–${negocio.tiempoMax} min`} />
            <Dato
              titulo="Envío"
              valor={
                !negocio.aceptaEntrega
                  ? "Solo recoger"
                  : negocio.costoEnvio === 0
                    ? "Gratis"
                    : dinero(negocio.costoEnvio)
              }
            />
            <Dato
              titulo="Mínimo"
              valor={negocio.pedidoMinimo > 0 ? dinero(negocio.pedidoMinimo) : "Sin mínimo"}
            />
          </dl>
        </div>
      </div>

      {!negocio.abierto && (
        <p className="mx-4 mt-6 rounded-2xl bg-superficie px-4 py-3 text-sm md:mx-0">
          Este negocio está cerrado ahora. Puedes ver su menú y pedir cuando abra.
        </p>
      )}

      {secciones.length > 1 && (
        <nav
          aria-label="Secciones del menú"
          className="sticky top-0 z-20 mt-6 border-b border-borde bg-white/95 backdrop-blur md:top-[72px]"
        >
          <ul className="carrusel flex gap-1 overflow-x-auto px-4 md:px-0">
            {secciones.map(([seccion]) => (
              <li key={seccion}>
                <a
                  href={`#${anclaDe(seccion)}`}
                  className="block whitespace-nowrap border-b-2 border-transparent px-3 py-3.5 text-[15px] font-semibold text-suave hover:border-foreground hover:text-foreground"
                >
                  {seccion}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="md:grid md:grid-cols-[1fr_320px] md:gap-10">
        <div className="px-4 md:px-0">
          {secciones.length === 0 && (
            <p className="mt-12 text-center text-suave">Este negocio todavía no sube su menú.</p>
          )}
          {secciones.map(([seccion, lista]) => (
            <section key={seccion} id={anclaDe(seccion)} className="scroll-mt-16 pt-8 md:scroll-mt-36">
              <h2 className="font-display text-[22px] font-bold tracking-tight">{seccion}</h2>
              <ul className="mt-3 grid gap-x-6 md:grid-cols-2 md:gap-y-4">
                {lista.map((p) => (
                  <ProductoFila
                    key={p.id}
                    producto={p}
                    negocio={paraCarrito}
                    cerrado={!negocio.abierto}
                  />
                ))}
              </ul>
            </section>
          ))}
          <p className="mt-10 text-sm text-suave">
            Pagas en efectivo o por transferencia.{" "}
            {negocio.aceptaRecoger && "También puedes pasar a recoger tu pedido."}
          </p>
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-[140px] mt-8">
            <ResumenLateral negocioId={negocio.id} />
          </div>
        </aside>
      </div>
    </article>
  );
}

function Logo({ negocio }: { negocio: Negocio }) {
  return (
    <div className="relative -mt-9 size-[72px] overflow-hidden rounded-2xl bg-vino-700 ring-4 ring-white md:-mt-12 md:size-24">
      {negocio.logoUrl ? (
        <Image src={negocio.logoUrl} alt="" fill sizes="96px" className="object-cover" />
      ) : (
        <span className="grid size-full place-items-center font-display text-2xl font-extrabold text-white md:text-3xl">
          {iniciales(negocio.nombre)}
        </span>
      )}
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex-1 px-4 py-3 text-center md:min-w-32">
      <dt className="text-xs text-suave">{titulo}</dt>
      <dd className="mt-0.5 font-bold tabular-nums">{valor}</dd>
    </div>
  );
}

function ProductoFila({
  producto: p,
  negocio,
  cerrado,
}: {
  producto: Producto;
  negocio: React.ComponentProps<typeof BotonAgregar>["negocio"];
  cerrado: boolean;
}) {
  const boton = (
    <BotonAgregar
      negocio={negocio}
      producto={{ productoId: p.id, nombre: p.nombre, precio: p.precio }}
      deshabilitado={cerrado}
    />
  );
  return (
    <li className="flex gap-4 border-b border-borde py-4 md:rounded-2xl md:border md:p-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-semibold leading-snug">{p.nombre}</h3>
        {p.descripcion && <p className="mt-1 line-clamp-2 text-sm text-suave">{p.descripcion}</p>}
        <p className="mt-auto pt-2 font-semibold tabular-nums">{dinero(p.precio)}</p>
      </div>
      {p.imagenUrl ? (
        <div className="relative size-28 shrink-0">
          <div className="relative size-full overflow-hidden rounded-xl bg-superficie">
            <Image src={p.imagenUrl} alt="" fill sizes="112px" className="object-cover" />
          </div>
          <div className="absolute bottom-1.5 right-1.5">{boton}</div>
        </div>
      ) : (
        <div className="self-end">{boton}</div>
      )}
    </li>
  );
}

function Cargando() {
  return (
    <div className="mx-auto max-w-7xl md:px-8" aria-busy="true" aria-label="Cargando negocio">
      <div className="h-56 animate-pulse bg-superficie md:mt-6 md:h-[320px] md:rounded-3xl" />
      <div className="space-y-3 px-4 pt-6 md:px-0">
        <div className="h-9 w-2/3 max-w-md animate-pulse rounded-lg bg-superficie" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-superficie" />
        <div className="h-16 max-w-md animate-pulse rounded-2xl bg-superficie" />
      </div>
    </div>
  );
}
