import { ChevronRight, CircleDollarSign, Clock, MapPin, Phone, ShoppingBag, Store, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FotoNegocio } from "@/components/foto";
import {
  inicioDeHoy,
  obtenerNegociosAdmin,
  obtenerPedidosAdmin,
  obtenerReportes,
  mesActual,
  obtenerPagosMes,
  obtenerResumenMes,
  requerirAdmin,
  type NegocioAdmin,
  type PagoMes,
  type PedidoAdmin,
  type ResumenMes,
} from "@/lib/admin";
import { buscarCategoria } from "@/lib/categorias";
import { ESTADOS_FINALES, etiquetaCorta } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import { estaDestacado } from "@/lib/datos";
import { BotonEstadoNegocio } from "./boton-estado-negocio";
import { ControlesCobro } from "./controles-cobro";

const nombreMes = new Intl.DateTimeFormat("es-MX", { month: "long" });

export const metadata: Metadata = { title: "Administración" };

const zona = "America/Matamoros";
const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: zona });
const diaLargo = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: zona });
const hora = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: zona });
const claveDia = new Intl.DateTimeFormat("en-CA", { timeZone: zona });
const diaCorto = new Intl.DateTimeFormat("es-MX", { weekday: "short", timeZone: zona });

export default function PaginaAdmin() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-3xl bg-superficie md:mt-0" />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  await requerirAdmin();
  const mesPago = mesActual();
  const [negocios, pedidos, reportes, mes, pagos] = await Promise.all([
    obtenerNegociosAdmin(),
    obtenerPedidosAdmin(),
    obtenerReportes(),
    obtenerResumenMes(),
    obtenerPagosMes(mesPago),
  ]);
  const reportesPendientes = reportes.filter((r) => !r.resuelto).length;
  const hoy = inicioDeHoy();
  const deHoy = pedidos.filter((p) => p.creadoEn >= hoy);
  const entregados = deHoy.filter((p) => p.estado === "entregado");
  const dias = ultimosDias(pedidos);
  const maximo = Math.max(1, ...dias.map((d) => d.pedidos));

  const pendientes = negocios.filter((n) => n.estado === "pendiente");
  const aprobados = negocios.filter((n) => n.estado === "aprobado");
  const suspendidos = negocios.filter((n) => n.estado === "suspendido");

  return (
    <div className="space-y-10 pt-6 md:pt-0">
      <header>
        <p className="text-sm font-semibold first-letter:uppercase text-suave">{diaLargo.format(new Date())}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">Resumen de hoy</h1>
      </header>
      {reportesPendientes > 0 && (
        <Link
          href="/admin/reportes"
          className="block rounded-2xl bg-dorado-100 px-4 py-3 text-sm font-semibold text-dorado-800"
        >
          Hay {reportesPendientes} {reportesPendientes === 1 ? "reporte de problema pendiente" : "reportes de problemas pendientes"}. Verlos →
        </Link>
      )}
      <section aria-label="Hoy" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato titulo="Pedidos hoy" valor={String(deHoy.length)} Icono={ShoppingBag} destacado />
        <Dato titulo="En curso" valor={String(deHoy.filter((p) => !ESTADOS_FINALES.includes(p.estado)).length)} Icono={Clock} />
        <Dato titulo="Vendido hoy" valor={dinero(entregados.reduce((s, p) => s + p.total, 0))} ayuda="Pedidos entregados" Icono={CircleDollarSign} />
        <Dato titulo="Negocios abiertos" valor={`${aprobados.filter((n) => n.abierto).length} de ${aprobados.length}`} Icono={Store} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-borde p-5">
          <h2 className="font-display text-lg font-bold">Pedidos de la semana</h2>
          <p className="text-sm text-suave">
            {dias.reduce((s, d) => s + d.pedidos, 0)} pedidos · {dinero(dias.reduce((s, d) => s + d.vendido, 0))} entregado
          </p>
          <ol className="mt-5 flex h-44 items-end gap-2" aria-label="Pedidos por día, últimos 7 días">
            {dias.map((d, i) => (
              <li key={d.clave} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-xs font-semibold tabular-nums text-suave">{d.pedidos}</span>
                <span
                  className={`w-full max-w-12 rounded-t-lg ${i === dias.length - 1 ? "bg-vino-700" : "bg-vino-100"}`}
                  style={{ height: `${Math.max(3, (d.pedidos / maximo) * 100)}%` }}
                  title={`${d.pedidos} pedidos · ${dinero(d.vendido)} entregado`}
                />
                <span className="text-xs text-suave">{d.etiqueta}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border border-borde p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm font-semibold text-vino-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {pedidos.length === 0 ? (
            <p className="mt-4 text-suave">Aún no hay pedidos.</p>
          ) : (
            <ul className="mt-2 divide-y divide-borde">
              {pedidos.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link href={`/pedidos/${p.id}`} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{p.negocio}</span>
                      <span className="block truncate text-xs text-suave">
                        #{p.folio} · {hora.format(new Date(p.creadoEn))} · {etiquetaCorta(p.estado)}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">{dinero(p.total)}</span>
                    <ChevronRight aria-hidden size={16} className="shrink-0 text-suave" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Grupo titulo="Por aprobar" cuenta={pendientes.length} resaltado vacio="No hay solicitudes nuevas.">
        {pendientes.map((n) => (
          <Tarjeta key={n.id} negocio={n} mes={mes.get(n.id)} cobro={{ mes: mesPago, pago: pagos.get(n.id) }} />
        ))}
      </Grupo>
      <Grupo titulo="Publicados" cuenta={aprobados.length} vacio="Aún no hay negocios publicados.">
        {aprobados.map((n) => (
          <Tarjeta key={n.id} negocio={n} mes={mes.get(n.id)} cobro={{ mes: mesPago, pago: pagos.get(n.id) }} />
        ))}
      </Grupo>
      {suspendidos.length > 0 && (
        <Grupo titulo="Suspendidos" cuenta={suspendidos.length} vacio="">
          {suspendidos.map((n) => (
            <Tarjeta key={n.id} negocio={n} mes={mes.get(n.id)} cobro={{ mes: mesPago, pago: pagos.get(n.id) }} />
          ))}
        </Grupo>
      )}
    </div>
  );
}

// shortcut: cuenta sobre los últimos 200 pedidos que ya trae obtenerPedidosAdmin; si una semana pasa de 200, contar en SQL.
function ultimosDias(pedidos: PedidoAdmin[]) {
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000);
    return { clave: claveDia.format(d), etiqueta: diaCorto.format(d).replace(".", ""), pedidos: 0, vendido: 0 };
  });
  for (const p of pedidos) {
    const dia = dias.find((d) => d.clave === claveDia.format(new Date(p.creadoEn)));
    if (!dia) continue;
    dia.pedidos++;
    if (p.estado === "entregado") dia.vendido += p.total;
  }
  return dias;
}

function Dato({
  titulo,
  valor,
  ayuda,
  Icono,
  destacado = false,
}: {
  titulo: string;
  valor: string;
  ayuda?: string;
  Icono: typeof Store;
  destacado?: boolean;
}) {
  return (
    <div className={`rounded-3xl p-4 md:p-5 ${destacado ? "bg-vino-700 text-white" : "bg-superficie"}`}>
      <span
        className={`grid size-9 place-items-center rounded-xl ${destacado ? "bg-white/15 text-dorado-300" : "bg-white text-vino-700"}`}
      >
        <Icono aria-hidden size={18} />
      </span>
      <p className={`mt-3 text-sm ${destacado ? "text-white/75" : "text-suave"}`}>{titulo}</p>
      <p className="mt-0.5 font-display text-2xl font-extrabold tabular-nums md:text-3xl">{valor}</p>
      {ayuda && <p className={`text-xs ${destacado ? "text-white/75" : "text-suave"}`}>{ayuda}</p>}
    </div>
  );
}

function Grupo({
  titulo,
  cuenta,
  resaltado = false,
  vacio,
  children,
}: {
  titulo: string;
  cuenta: number;
  resaltado?: boolean;
  vacio: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        {titulo}
        <span
          className={`rounded-full px-2 py-0.5 text-sm tabular-nums ${
            resaltado && cuenta > 0 ? "bg-vino-700 text-white" : "bg-superficie text-suave"
          }`}
        >
          {cuenta}
        </span>
      </h2>
      {cuenta === 0 ? (
        <p className="mt-3 text-suave">{vacio}</p>
      ) : (
        <div className="mt-3 grid gap-4 xl:grid-cols-2">{children}</div>
      )}
    </section>
  );
}

function Tarjeta({
  negocio: n,
  mes,
  cobro,
}: {
  negocio: NegocioAdmin;
  mes?: ResumenMes;
  cobro: { mes: string; pago: PagoMes | undefined };
}) {
  return (
    <article className={`flex flex-col rounded-3xl border-2 p-4 md:p-5 ${n.estado === "pendiente" ? "border-vino-700" : "border-borde"}`}>
      <div className="flex items-start gap-3">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-superficie [container-type:inline-size]">
          <FotoNegocio src={n.logoUrl ?? n.portadaUrl} nombre={n.nombre} sizes="56px" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{n.nombre}</p>
          <p className="text-sm text-suave">
            {buscarCategoria(n.categoria)?.nombre ?? "Sin categoría"} · {n.productos}{" "}
            {n.productos === 1 ? "producto" : "productos"} · desde {fecha.format(new Date(n.creadoEn))}
          </p>
        </div>
        {n.estado === "aprobado" && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${n.abierto ? "bg-abierto/10 text-abierto" : "bg-superficie text-suave"}`}
          >
            {n.abierto ? "Abierto" : "Cerrado"}
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-1.5 text-[15px]">
        <li className="flex items-center gap-2">
          <User aria-hidden size={16} className="shrink-0 text-suave" /> {n.dueno}
        </li>
        {n.telefono && (
          <li className="flex items-center gap-2">
            <Phone aria-hidden size={16} className="shrink-0 text-suave" />
            <a href={`tel:${n.telefono}`} className="underline underline-offset-2">
              {n.telefono}
            </a>
          </li>
        )}
        {n.direccion && (
          <li className="flex items-start gap-2">
            <MapPin aria-hidden size={16} className="mt-1 shrink-0 text-suave" /> {n.direccion}
          </li>
        )}
      </ul>
      {n.descripcion && <p className="mt-2 text-sm text-suave">{n.descripcion}</p>}
      {n.estado === "aprobado" && (
        <p className="mt-3 rounded-xl bg-superficie px-3 py-2 text-sm">
          <strong>Este mes:</strong> {mes?.pedidos ?? 0} {mes?.pedidos === 1 ? "pedido" : "pedidos"} ·{" "}
          {dinero(mes?.entregado ?? 0)} entregado
          {(mes?.perdidos ?? 0) > 0 && <span className="text-suave"> · {mes!.perdidos} cancelados o rechazados</span>}
        </p>
      )}
      {n.estado === "aprobado" && (
        <ControlesCobro
          id={n.id}
          mes={cobro.mes}
          nombreMes={nombreMes.format(new Date(`${cobro.mes}T12:00:00`))}
          pago={cobro.pago}
          destacadoHasta={estaDestacado(n) ? n.destacadoHasta! : null}
        />
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {n.estado === "pendiente" && (
          <>
            <BotonEstadoNegocio id={n.id} estado="suspendido" texto="Rechazar" nombre={n.nombre} />
            <BotonEstadoNegocio id={n.id} estado="aprobado" texto="Aprobar y publicar" nombre={n.nombre} principal />
          </>
        )}
        {n.estado === "aprobado" && (
          <>
            <Link href={`/negocios/${n.slug}`} className="pulsable inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold hover:bg-superficie">
              Ver página
            </Link>
            <BotonEstadoNegocio id={n.id} estado="suspendido" texto="Suspender" nombre={n.nombre} />
          </>
        )}
        {n.estado === "suspendido" && (
          <BotonEstadoNegocio id={n.id} estado="aprobado" texto="Reactivar" nombre={n.nombre} principal />
        )}
      </div>
    </article>
  );
}
