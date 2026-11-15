import { ChartLine, ChartPie, Trophy, TriangleAlert, Users, CircleDollarSign, Clock, MapPin, Phone, Receipt, ShoppingBag, Store, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FotoNegocio } from "@/components/foto";
import { COLORES_DONA, Dato, Dona, Grafica, Panel, ultimosDias } from "@/components/tablero";
import {
  inicioDeHoy,
  obtenerNegociosAdmin,
  obtenerPedidosAdmin,
  obtenerReportes,
  mesActual,
  obtenerPagosMes,
  obtenerResumenMes,
  obtenerClientesMes,
  requerirAdmin,
  type NegocioAdmin,
  type PagoMes,
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
  const [negocios, pedidos, reportes, mes, pagos, clientes] = await Promise.all([
    obtenerNegociosAdmin(),
    obtenerPedidosAdmin(),
    obtenerReportes(),
    obtenerResumenMes(),
    obtenerPagosMes(mesPago),
    obtenerClientesMes(),
  ]);
  const reportesPendientes = reportes.filter((r) => !r.resuelto).length;
  const hoy = inicioDeHoy();
  const ayer = new Date(new Date(hoy).getTime() - 86_400_000).toISOString();
  const deHoy = pedidos.filter((p) => p.creadoEn >= hoy);
  const deAyer = pedidos.filter((p) => p.creadoEn >= ayer && p.creadoEn < hoy);
  const vendido = (lista: typeof pedidos) => lista.filter((p) => p.estado === "entregado").reduce((s, p) => s + p.total, 0);
  const dias = ultimosDias(pedidos);

  const pendientes = negocios.filter((n) => n.estado === "pendiente");
  const aprobados = negocios.filter((n) => n.estado === "aprobado");
  const suspendidos = negocios.filter((n) => n.estado === "suspendido");
  const categorias = porCategoria(aprobados, mes);
  const ranking = aprobados
    .map((n) => ({ n, r: mes.get(n.id) ?? { pedidos: 0, entregado: 0, perdidos: 0, sinRespuesta: 0, sinCerrar: 0, respuestaMin: null } }))
    .sort((a, b) => b.r.entregado - a.r.entregado || b.r.pedidos - a.r.pedidos);
  // Señales de mal servicio o de estadísticas que no reflejan la realidad.
  const alertas = ranking.flatMap(({ n, r }) => [
    ...(r.sinCerrar > 0
      ? [{ id: `${n.id}-c`, texto: `${n.nombre} tiene ${r.sinCerrar} ${r.sinCerrar === 1 ? "pedido abierto" : "pedidos abiertos"} desde hace más de 6 horas. Sus ventas no cuentan hasta que los cierre.` }]
      : []),
    ...(r.sinRespuesta > 0
      ? [{ id: `${n.id}-r`, texto: `${n.nombre} dejó ${r.sinRespuesta} ${r.sinRespuesta === 1 ? "pedido" : "pedidos"} sin contestar este mes; se cancelaron solos.` }]
      : []),
    ...((r.respuestaMin ?? 0) > 5
      ? [{ id: `${n.id}-t`, texto: `${n.nombre} tarda ${Math.round(r.respuestaMin!)} min en aceptar un pedido.` }]
      : []),
  ]);
  const ventasMes = ranking.reduce((s, { r }) => s + r.entregado, 0);

  return (
    <div className="space-y-8 pt-6 md:pt-0">
      <header>
        <p className="text-sm font-semibold text-suave first-letter:uppercase">{diaLargo.format(new Date())}</p>
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
        <Dato titulo="Pedidos hoy" valor={String(deHoy.length)} Icono={ShoppingBag} hoy={deHoy.length} ayer={deAyer.length} />
        <Dato titulo="En curso" valor={String(deHoy.filter((p) => !ESTADOS_FINALES.includes(p.estado)).length)} Icono={Clock} nota="Sin entregar todavía" />
        <Dato titulo="Vendido hoy" valor={dinero(vendido(deHoy))} Icono={CircleDollarSign} hoy={vendido(deHoy)} ayer={vendido(deAyer)} />
        <Dato
          titulo="Negocios abiertos"
          valor={`${aprobados.filter((n) => n.abierto).length} de ${aprobados.length}`}
          Icono={Store}
          nota={pendientes.length > 0 ? `${pendientes.length} por aprobar` : "Ninguno por aprobar"}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel titulo="Pedidos de las últimas 2 semanas" Icono={ChartLine}>
          <p className="-mt-2 text-sm text-suave">
            {dias.reduce((s, d) => s + d.pedidos, 0)} pedidos · {dinero(dias.reduce((s, d) => s + d.vendido, 0))} entregado
          </p>
          <Grafica dias={dias} />
        </Panel>
        <Panel titulo="Pedidos del mes por categoría" Icono={ChartPie}>
          <Dona categorias={categorias} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Panel titulo="Clientes del mes" Icono={Users}>
          <Dona
            categorias={[
              { nombre: "Repiten", pedidos: clientes.repiten, color: COLORES_DONA[0] },
              { nombre: "Nuevos", pedidos: clientes.nuevos, color: COLORES_DONA[2] },
            ]}
            unidad="clientes"
            vacio="Aún no hay clientes este mes."
          />
          {clientes.total > 0 && (
            <p className="mt-4 rounded-xl bg-superficie px-3 py-2 text-sm">
              {Math.round((clientes.pedidosDeQuienRepite / Math.max(1, [...mes.values()].reduce((s, r) => s + r.pedidos + r.perdidos, 0))) * 100)}% de
              los pedidos vienen de clientes que repiten.
            </p>
          )}
        </Panel>
        <Panel titulo="Para revisar" Icono={TriangleAlert}>
          {alertas.length === 0 ? (
            <p className="text-suave">Todo en orden: los negocios contestan rápido y cierran sus pedidos.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {alertas.map((a) => (
                <li key={a.id} className="rounded-xl bg-dorado-100 px-3 py-2 text-dorado-800">
                  {a.texto}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        titulo="Últimos pedidos"
        Icono={Receipt}
        accion={
          <Link href="/admin/pedidos" className="text-sm font-semibold text-vino-700 hover:underline">
            Ver todos
          </Link>
        }
      >
        {pedidos.length === 0 ? (
          <p className="text-suave">Aún no hay pedidos.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-superficie text-suave">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Fecha</th>
                  <th className="px-2 py-2.5 font-semibold">Negocio</th>
                  <th className="px-2 py-2.5 font-semibold">Cliente</th>
                  <th className="px-2 py-2.5 font-semibold">Estado</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {pedidos.slice(0, 6).map((p) => (
                  <tr key={p.id} className="relative hover:bg-superficie/60">
                    <td className="whitespace-nowrap px-5 py-3 tabular-nums text-suave">{hora.format(new Date(p.creadoEn))}</td>
                    <td className="max-w-48 truncate px-2 py-3 font-semibold">
                      <Link href={`/pedidos/${p.id}`} className="after:absolute after:inset-0">
                        #{p.folio} · {p.negocio}
                      </Link>
                    </td>
                    <td className="max-w-40 truncate px-2 py-3">{p.cliente}</td>
                    <td className="px-2 py-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${
                          ESTADOS_FINALES.includes(p.estado) ? "bg-superficie text-suave" : "bg-vino-100 text-vino-800"
                        }`}
                      >
                        {etiquetaCorta(p.estado)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{dinero(p.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel titulo={`Negocios en ${nombreMes.format(new Date(`${mesPago}T12:00:00`))}`} Icono={Trophy}>
        <p className="-mt-2 mb-3 text-sm text-suave">
          {dinero(ventasMes)} entregado entre todos · {ranking.reduce((s, { r }) => s + r.pedidos, 0)} pedidos
        </p>
        {ranking.length === 0 ? (
          <p className="text-suave">Aún no hay negocios publicados.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-superficie text-suave">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Negocio</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Pedidos</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Cancelados</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Acepta en</th>
                  <th className="px-2 py-2.5 font-semibold">Entregado</th>
                  <th className="px-5 py-2.5 font-semibold">Cuota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {ranking.map(({ n, r }) => (
                  <tr key={n.id}>
                    <td className="max-w-56 px-5 py-3">
                      <span className="flex items-center gap-2">
                        <span
                          aria-label={n.abierto ? "Abierto" : "Cerrado"}
                          className={`size-2 shrink-0 rounded-full ${n.abierto ? "bg-abierto" : "bg-borde"}`}
                        />
                        <span className="truncate font-semibold">{n.nombre}</span>
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right tabular-nums">{r.pedidos}</td>
                    <td className={`px-2 py-3 text-right tabular-nums ${r.perdidos > 0 ? "text-vino-600" : "text-suave"}`}>{r.perdidos}</td>
                    <td className={`px-2 py-3 text-right tabular-nums ${(r.respuestaMin ?? 0) > 5 ? "font-semibold text-vino-600" : "text-suave"}`}>
                      {r.respuestaMin === null ? "—" : `${Math.max(1, Math.round(r.respuestaMin))} min`}
                    </td>
                    <td className="w-56 px-2 py-3">
                      <span className="flex items-center gap-2">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-superficie">
                          <span
                            className="block h-full rounded-full bg-vino-700"
                            style={{ width: `${ventasMes ? (r.entregado / ventasMes) * 100 : 0}%` }}
                          />
                        </span>
                        <span className="w-20 text-right font-semibold tabular-nums">{dinero(r.entregado)}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${
                          pagos.has(n.id) ? "bg-abierto/10 text-abierto" : "bg-dorado-100 text-dorado-800"
                        }`}
                      >
                        {pagos.has(n.id) ? "Pagada" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

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

function porCategoria(negocios: NegocioAdmin[], mes: Map<string, ResumenMes>) {
  const cuentas = new Map<string, number>();
  for (const n of negocios) {
    const nombre = buscarCategoria(n.categoria)?.nombre ?? "Otros";
    cuentas.set(nombre, (cuentas.get(nombre) ?? 0) + (mes.get(n.id)?.pedidos ?? 0));
  }
  const orden = [...cuentas].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  // Más de 5 categorías se juntan en "Otras" para que la dona se lea.
  const visibles = orden.slice(0, 5);
  const resto = orden.slice(5).reduce((s, [, v]) => s + v, 0);
  if (resto > 0) visibles.push(["Otras", resto]);
  return visibles.map(([nombre, pedidos], i) => ({ nombre, pedidos, color: COLORES_DONA[i] }));
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
