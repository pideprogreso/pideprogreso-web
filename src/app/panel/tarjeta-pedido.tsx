import { Banknote, Bike, Clock, CreditCard, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { accionesNegocio, etiquetaCorta } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import type { Pedido } from "@/lib/pedidos";
import { BotonesEstado } from "./botones-estado";
import { Desplegable } from "./vistas-pedidos";

const hora = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Matamoros" });

const minutosDesde = (desde: string, ahora: number) => Math.max(0, Math.round((ahora - new Date(desde).getTime()) / 60000));

function hace(desde: string, ahora: number) {
  const min = minutosDesde(desde, ahora);
  if (min < 1) return "Ahora";
  if (min < 60) return `${min} min`;
  return hora.format(new Date(desde));
}

// "nuevo": tarjeta completa con Aceptar/Rechazar. "fila": compacta con el siguiente paso. "historial": solo lectura.
export function TarjetaPedido({
  pedido: p,
  ahora,
  modo,
}: {
  pedido: Pedido;
  ahora: number;
  modo: "nuevo" | "fila" | "historial";
}) {
  const acciones = accionesNegocio(p.estado, p.modalidad);
  const piezas = p.lineas.reduce((s, l) => s + l.cantidad, 0);
  const resumen = `${p.modalidad === "entrega" ? "Domicilio" : "Recoger"} · ${piezas} ${piezas === 1 ? "producto" : "productos"} · ${dinero(p.total)}`;

  if (modo === "historial") {
    return (
      <article className="rounded-2xl border border-borde px-4 py-3">
        <Desplegable
          resumen={
            <>
              <span className="block truncate font-semibold">
                #{p.folio} · {p.nombreContacto}
              </span>
              <span className="block text-sm text-suave">
                {hora.format(new Date(p.creadoEn))} · {resumen}
              </span>
            </>
          }
          accion={<span className="shrink-0 rounded-full bg-superficie px-2.5 py-1 text-xs font-bold text-suave">{p.motivoCancelacion === "sin_respuesta" ? "Sin respuesta" : etiquetaCorta(p.estado)}</span>}
        >
          <Detalle p={p} />
        </Desplegable>
      </article>
    );
  }

  if (modo === "fila") {
    return (
      <article className="rounded-2xl border border-borde px-4 py-3">
        <Desplegable
          resumen={
            <>
              <span className="block truncate font-display text-base font-bold">
                #{p.folio} · {p.nombreContacto}
              </span>
              <span className="block truncate text-sm text-suave">
                {etiquetaCorta(p.estado)} · {dinero(p.total)}
              </span>
            </>
          }
          accion={<BotonesEstado pedidoId={p.id} acciones={acciones} cuales="principal" />}
        >
          <Detalle p={p} />
          <div className="mt-4 flex gap-2">
            <Contacto p={p} />
            <BotonesEstado pedidoId={p.id} acciones={acciones} cuales="secundarias" />
          </div>
        </Desplegable>
      </article>
    );
  }

  const espera = minutosDesde(p.creadoEn, ahora);
  return (
    <article className="flex flex-col rounded-2xl border-2 border-vino-700 p-4">
      <header className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-display text-lg font-bold">
          #{p.folio} · {p.nombreContacto}
        </p>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
            espera >= 5 ? "bg-dorado-100 text-dorado-800" : "bg-superficie"
          }`}
          title="Tiempo esperando a que lo aceptes"
        >
          <Clock aria-hidden size={14} />
          {hace(p.creadoEn, ahora)}
        </span>
      </header>
      <div className="mt-3">
        <Detalle p={p} />
      </div>
      <div className="mt-auto flex gap-2 pt-4">
        <Contacto p={p} />
        <BotonesEstado pedidoId={p.id} acciones={acciones} />
      </div>
    </article>
  );
}

function Detalle({ p }: { p: Pedido }) {
  return (
    <>
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-superficie px-3 py-1">
          {p.modalidad === "entrega" ? <Bike aria-hidden size={16} /> : <Store aria-hidden size={16} />}
          {p.modalidad === "entrega" ? "A domicilio" : "Pasa a recoger"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-superficie px-3 py-1">
          {p.metodoPago === "efectivo" ? <Banknote aria-hidden size={16} /> : <CreditCard aria-hidden size={16} />}
          {p.metodoPago === "efectivo" ? "Efectivo" : "Transferencia"}
        </span>
      </div>

      {p.direccionEntrega && (
        <div className="mt-3 text-[15px] leading-snug">
          <p>{p.direccionEntrega}</p>
          {p.referencias && <p className="text-suave">{p.referencias}</p>}
          {p.ubicacion && (
            <a
              href={`https://www.google.com/maps?q=${p.ubicacion.lat},${p.ubicacion.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-superficie px-4 text-sm font-semibold hover:bg-superficie-2"
            >
              <MapPin aria-hidden size={16} className="text-vino-700" />
              Ver en Google Maps
            </a>
          )}
        </div>
      )}

      <ul className="mt-3 space-y-1 border-t border-borde pt-3 text-[15px]">
        {p.lineas.map((l, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span>
              <span className="font-bold tabular-nums">{l.cantidad}×</span> {l.nombre}
            </span>
            <span className="tabular-nums text-suave">{dinero(l.importe)}</span>
          </li>
        ))}
      </ul>
      {p.notas && (
        <p className="mt-3 rounded-xl bg-dorado-100 px-3 py-2 text-sm text-dorado-800">
          <strong>Nota:</strong> {p.notas}
        </p>
      )}
      <p className="mt-3 flex justify-between border-t border-borde pt-3 font-display text-lg font-bold">
        <span>Total{p.costoEnvio > 0 && <span className="ml-1 text-sm font-medium text-suave">(envío {dinero(p.costoEnvio)})</span>}</span>
        <span className="tabular-nums">{dinero(p.total)}</span>
      </p>
    </>
  );
}

function Contacto({ p }: { p: Pedido }) {
  return (
    <>
      <a
        href={`tel:${p.telefonoContacto}`}
        aria-label={`Llamar a ${p.nombreContacto}`}
        className="grid size-12 shrink-0 place-items-center rounded-full border border-borde hover:bg-superficie"
      >
        <Phone aria-hidden size={20} />
      </a>
      <a
        href={`https://wa.me/52${p.telefonoContacto}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`WhatsApp a ${p.nombreContacto}`}
        className="grid size-12 shrink-0 place-items-center rounded-full border border-borde hover:bg-superficie"
      >
        <MessageCircle aria-hidden size={20} />
      </a>
    </>
  );
}
