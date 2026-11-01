import { Check, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ESTADOS_FINALES, pasosDe, textoEstado } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import { obtenerPedido, type Pedido } from "@/lib/pedidos";
import { Actualizador } from "./actualizador";
import { BotonCancelar } from "./boton-cancelar";

export const metadata: Metadata = { title: "Mi pedido" };

export default function PaginaPedido({ params, searchParams }: PageProps<"/pedidos/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8">
      <Suspense fallback={<Cargando />}>
        <Contenido params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Contenido({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const pedido = await obtenerPedido(id);
  if (!pedido) notFound();

  const final = ESTADOS_FINALES.includes(pedido.estado);
  const { titulo, detalle } =
    pedido.motivoCancelacion === "sin_respuesta"
      ? {
          titulo: "El negocio no respondió a tiempo",
          detalle: "Cancelamos tu pedido porque no lo aceptaron en 10 minutos. Puedes pedir en otro negocio. Si ya transferiste, llámales para que te devuelvan tu dinero.",
        }
      : textoEstado(pedido.estado, pedido.modalidad);
  const nuevo = sp.nuevo === "1";

  return (
    <>
      {!final && <Actualizador />}

      <section className="pt-6 md:pt-10">
        {nuevo && (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-abierto/10 px-3 py-1.5 text-sm font-semibold text-abierto">
            <Check aria-hidden size={16} strokeWidth={3} /> Enviamos tu pedido a {pedido.negocio.nombre}
          </p>
        )}
        <p className="text-sm text-suave">
          Pedido #{pedido.folio} en{" "}
          <Link href={`/negocios/${pedido.negocio.slug}`} className="font-semibold text-foreground underline-offset-2 hover:underline">
            {pedido.negocio.nombre}
          </Link>
        </p>
        <h1
          aria-live="polite"
          className={`mt-1 font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] md:text-[40px] ${
            pedido.estado === "cancelado" || pedido.estado === "rechazado" ? "text-vino-700" : ""
          }`}
        >
          {titulo}
        </h1>
        <p className="mt-2 text-suave">{detalle}</p>
      </section>

      {pedido.estado !== "cancelado" && pedido.estado !== "rechazado" && <Linea pedido={pedido} />}

      {pedido.metodoPago === "transferencia" && !final && (
        <section className="mt-8 rounded-2xl bg-dorado-100 p-5 text-dorado-800">
          <h2 className="font-display text-lg font-bold text-foreground">Pago por transferencia</h2>
          {pedido.negocio.datosTransferencia ? (
            <>
              <p className="mt-1 text-sm">Transfiere {dinero(pedido.total)} a:</p>
              <p className="mt-2 whitespace-pre-line font-semibold text-foreground">
                {pedido.negocio.datosTransferencia}
              </p>
              <p className="mt-2 text-sm">Pon el número de pedido #{pedido.folio} en el concepto.</p>
            </>
          ) : (
            <p className="mt-1 text-sm">El negocio te enviará sus datos para transferir {dinero(pedido.total)}.</p>
          )}
        </section>
      )}

      <Contactar pedido={pedido} />

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Detalle</h2>
        <ul className="mt-3 space-y-2">
          {pedido.lineas.map((l, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                <span className="font-semibold tabular-nums">{l.cantidad}×</span> {l.nombre}
              </span>
              <span className="tabular-nums">{dinero(l.importe)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-borde pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-suave">Productos</dt>
            <dd className="tabular-nums">{dinero(pedido.subtotal)}</dd>
          </div>
          {pedido.modalidad === "entrega" && (
            <div className="flex justify-between">
              <dt className="text-suave">Envío</dt>
              <dd className="tabular-nums">{pedido.costoEnvio === 0 ? "Gratis" : dinero(pedido.costoEnvio)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-1 font-display text-lg font-bold">
            <dt>Total, en {pedido.metodoPago === "efectivo" ? "efectivo" : "transferencia"}</dt>
            <dd className="tabular-nums">{dinero(pedido.total)}</dd>
          </div>
        </dl>
        <dl className="mt-6 grid gap-3 rounded-2xl bg-superficie p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-suave">{pedido.modalidad === "entrega" ? "Entregar en" : "Lo recoges en"}</dt>
            <dd className="mt-0.5 font-medium">
              {pedido.modalidad === "entrega" ? pedido.direccionEntrega : pedido.negocio.nombre}
              {pedido.modalidad === "entrega" && pedido.referencias && (
                <span className="block font-normal text-suave">{pedido.referencias}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-suave">A nombre de</dt>
            <dd className="mt-0.5 font-medium">
              {pedido.nombreContacto}, {pedido.telefonoContacto}
            </dd>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2">
              <dt className="text-suave">Notas</dt>
              <dd className="mt-0.5 font-medium">{pedido.notas}</dd>
            </div>
          )}
        </dl>
      </section>

      {pedido.estado === "recibido" && (
        <div className="mt-8">
          <BotonCancelar id={pedido.id} />
        </div>
      )}

      <Link
        href="/pedidos"
        className="mt-8 inline-block text-sm font-semibold underline-offset-2 hover:underline"
      >
        Ver todos mis pedidos
      </Link>
    </>
  );
}

function Linea({ pedido }: { pedido: Pedido }) {
  const pasos = pasosDe(pedido.modalidad);
  const actual = pasos.indexOf(pedido.estado);
  return (
    <ol className="mt-8 grid gap-0" aria-label="Avance del pedido">
      {pasos.map((paso, i) => {
        const hecho = i < actual || pedido.estado === "entregado";
        const enCurso = i === actual && pedido.estado !== "entregado";
        const { titulo } = textoEstado(paso, pedido.modalidad);
        return (
          <li key={paso} className="relative flex gap-4 pb-5 last:pb-0">
            {i < pasos.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5 ${hecho ? "bg-foreground" : "bg-borde"}`}
              />
            )}
            <span
              aria-hidden
              className={`relative grid size-6 shrink-0 place-items-center rounded-full ${
                hecho
                  ? "bg-foreground text-white"
                  : enCurso
                    ? "bg-vino-700 ring-4 ring-vino-100"
                    : "border-2 border-borde bg-white"
              }`}
            >
              {hecho && <Check size={14} strokeWidth={3} />}
              {enCurso && <span className="size-2 animate-pulse rounded-full bg-white" />}
            </span>
            <span
              className={`pt-0.5 text-[15px] ${enCurso ? "font-bold" : hecho ? "font-medium" : "text-suave"}`}
              aria-current={enCurso ? "step" : undefined}
            >
              {titulo}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Contactar({ pedido }: { pedido: Pedido }) {
  const { telefono, whatsapp } = pedido.negocio;
  if (!telefono && !whatsapp) return null;
  const wa = whatsapp?.replace(/\D/g, "");
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {wa && (
        <a
          href={`https://wa.me/52${wa.slice(-10)}?text=${encodeURIComponent(`Hola, es sobre mi pedido #${pedido.folio} de PideProgreso.`)}`}
          target="_blank"
          rel="noopener"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f8f4e] px-5 text-sm font-semibold text-white hover:bg-[#187540]"
        >
          <MessageCircle aria-hidden size={18} /> Escribir por WhatsApp
        </a>
      )}
      {telefono && (
        <a
          href={`tel:${telefono.replace(/[^\d+]/g, "")}`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-superficie px-5 text-sm font-semibold hover:bg-superficie-2"
        >
          <Phone aria-hidden size={18} /> Llamar al negocio
        </a>
      )}
    </div>
  );
}

function Cargando() {
  return (
    <div className="pt-10" aria-busy="true" aria-label="Cargando pedido">
      <div className="h-4 w-48 animate-pulse rounded bg-superficie" />
      <div className="mt-3 h-10 w-3/4 animate-pulse rounded-lg bg-superficie" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-6 w-56 animate-pulse rounded bg-superficie" />
        ))}
      </div>
    </div>
  );
}
