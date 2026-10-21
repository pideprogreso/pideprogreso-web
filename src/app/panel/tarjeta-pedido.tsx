import { Banknote, Bike, CreditCard, MessageCircle, Phone, Store } from "lucide-react";
import { accionesNegocio, etiquetaCorta } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import type { Pedido } from "@/lib/pedidos";
import { BotonesEstado } from "./botones-estado";

const hora = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Matamoros" });

function hace(desde: string, ahora: number) {
  const min = Math.max(0, Math.round((ahora - new Date(desde).getTime()) / 60000));
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  return hora.format(new Date(desde));
}

export function TarjetaPedido({ pedido: p, ahora, compacta = false }: { pedido: Pedido; ahora: number; compacta?: boolean }) {
  const acciones = accionesNegocio(p.estado, p.modalidad);
  const nuevo = p.estado === "recibido";
  const piezas = p.lineas.reduce((s, l) => s + l.cantidad, 0);

  if (compacta) {
    return (
      <article className="flex items-center gap-3 rounded-2xl border border-borde px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            #{p.folio} · {p.nombreContacto}
          </p>
          <p className="text-sm text-suave">
            {hora.format(new Date(p.creadoEn))} · {piezas} {piezas === 1 ? "producto" : "productos"}
          </p>
        </div>
        <span className="rounded-full bg-superficie px-2 py-0.5 text-xs font-bold text-suave">{etiquetaCorta(p.estado)}</span>
        <span className="font-semibold tabular-nums">{dinero(p.total)}</span>
      </article>
    );
  }

  return (
    <article className={`flex flex-col rounded-2xl border-2 p-4 ${nuevo ? "border-vino-700" : "border-borde"}`}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">
            #{p.folio} · {p.nombreContacto}
          </p>
          <p className="text-sm text-suave">{hace(p.creadoEn, ahora)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${nuevo ? "bg-vino-700 text-white" : "bg-superficie"}`}>
          {nuevo ? "Nuevo" : etiquetaCorta(p.estado)}
        </span>
      </header>

      <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-superficie px-3 py-1">
          {p.modalidad === "entrega" ? <Bike aria-hidden size={16} /> : <Store aria-hidden size={16} />}
          {p.modalidad === "entrega" ? "A domicilio" : "Pasa a recoger"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-superficie px-3 py-1">
          {p.metodoPago === "efectivo" ? <Banknote aria-hidden size={16} /> : <CreditCard aria-hidden size={16} />}
          {p.metodoPago === "efectivo" ? "Efectivo" : "Transferencia"}
        </span>
      </div>

      {p.direccionEntrega && <p className="mt-3 text-[15px] leading-snug">{p.direccionEntrega}</p>}

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

      <div className="mt-auto flex gap-2 pt-4">
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
        <BotonesEstado pedidoId={p.id} acciones={acciones} />
      </div>
    </article>
  );
}
