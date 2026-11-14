import { ChartLine, ChartPie, CircleDollarSign, Clock, MapPin, Phone, Receipt, ShoppingBag, Store, User } from "lucide-react";
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
const diaMes = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: zona });

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
  const ayer = new Date(new Date(hoy).getTime() - 86_400_000).toISOString();
  const deHoy = pedidos.filter((p) => p.creadoEn >= hoy);
  const deAyer = pedidos.filter((p) => p.creadoEn >= ayer && p.creadoEn < hoy);
  const vendido = (lista: PedidoAdmin[]) => lista.filter((p) => p.estado === "entregado").reduce((s, p) => s + p.total, 0);
  const dias = ultimosDias(pedidos);

  const pendientes = negocios.filter((n) => n.estado === "pendiente");
  const aprobados = negocios.filter((n) => n.estado === "aprobado");
  const suspendidos = negocios.filter((n) => n.estado === "suspendido");
  const categorias = porCategoria(aprobados, mes);

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

type Dia = { clave: string; etiqueta: string; pedidos: number; vendido: number };

// shortcut: cuenta sobre los últimos 200 pedidos que ya trae obtenerPedidosAdmin; si 2 semanas pasan de 200, contar en SQL.
function ultimosDias(pedidos: PedidoAdmin[], cuantos = 14): Dia[] {
  const dias = Array.from({ length: cuantos }, (_, i) => {
    const d = new Date(Date.now() - (cuantos - 1 - i) * 86_400_000);
    return { clave: claveDia.format(d), etiqueta: diaMes.format(d), pedidos: 0, vendido: 0 };
  });
  for (const p of pedidos) {
    const dia = dias.find((d) => d.clave === claveDia.format(new Date(p.creadoEn)));
    if (!dia) continue;
    dia.pedidos++;
    if (p.estado === "entregado") dia.vendido += p.total;
  }
  return dias;
}

const COLORES_DONA = ["#3a0617", "#85173c", "#f2b632", "#d98aa3", "#f8cd57", "#ecebe8"];

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

function Panel({
  titulo,
  Icono,
  accion,
  children,
}: {
  titulo: string;
  Icono: typeof Store;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-borde bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <Icono aria-hidden size={20} className="shrink-0 text-vino-700" />
        <h2 className="flex-1 font-display text-lg font-bold">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

function Grafica({ dias }: { dias: Dia[] }) {
  const [ancho, alto, izq, abajo] = [640, 220, 32, 26];
  const tope = Math.max(4, Math.ceil(Math.max(...dias.map((d) => d.pedidos)) / 4) * 4);
  const x = (i: number) => izq + (i * (ancho - izq - 8)) / (dias.length - 1);
  const y = (v: number) => 8 + (1 - v / tope) * (alto - abajo - 8);
  const linea = dias.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.pedidos)}`).join("");
  const marcas = [0, 1, 2, 3, 4].map((k) => (tope * k) / 4);
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="mt-4 w-full" role="img" aria-label={`Pedidos por día: ${dias.map((d) => `${d.etiqueta} ${d.pedidos}`).join(", ")}`}>
      <defs>
        <linearGradient id="relleno-pedidos" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#85173c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#85173c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {marcas.map((m) => (
        <g key={m}>
          <line x1={izq} x2={ancho - 8} y1={y(m)} y2={y(m)} stroke="#e6e3df" />
          <text x={izq - 8} y={y(m) + 4} textAnchor="end" fontSize="12" fill="#66605c">
            {m}
          </text>
        </g>
      ))}
      <path d={`${linea}L${x(dias.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill="url(#relleno-pedidos)" />
      <path d={linea} fill="none" stroke="#6e0f2e" strokeWidth="2.5" strokeLinejoin="round" />
      {dias.map((d, i) => (
        <g key={d.clave}>
          <circle cx={x(i)} cy={y(d.pedidos)} r={i === dias.length - 1 ? 5 : 3.5} fill={i === dias.length - 1 ? "#f2b632" : "#6e0f2e"} stroke="#fff" strokeWidth="1.5">
            <title>{`${d.etiqueta}: ${d.pedidos} pedidos · ${dinero(d.vendido)} entregado`}</title>
          </circle>
          {i % 2 === dias.length % 2 && (
            <text x={x(i)} y={alto - 6} textAnchor="middle" fontSize="12" fill="#66605c">
              {d.etiqueta}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Dona({ categorias }: { categorias: { nombre: string; pedidos: number; color: string }[] }) {
  const total = categorias.reduce((s, c) => s + c.pedidos, 0);
  if (total === 0) return <p className="text-suave">Aún no hay pedidos este mes.</p>;
  const partes = categorias.map((c, i) => {
    const antes = categorias.slice(0, i).reduce((s, o) => s + o.pedidos, 0);
    return `${c.color} ${(antes / total) * 360}deg ${((antes + c.pedidos) / total) * 360}deg`;
  });
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative size-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${partes.join(",")})` }}>
        <div className="absolute inset-7 grid place-items-center rounded-full bg-white text-center">
          <p>
            <span className="block font-display text-2xl font-extrabold tabular-nums">{total}</span>
            <span className="text-xs text-suave">pedidos</span>
          </p>
        </div>
      </div>
      <ul className="min-w-36 flex-1 space-y-2 text-sm">
        {categorias.map((c) => (
          <li key={c.nombre} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: c.color }} />
            <span className="flex-1 truncate">{c.nombre}</span>
            <span className="font-semibold tabular-nums">{Math.round((c.pedidos / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dato({
  titulo,
  valor,
  Icono,
  hoy,
  ayer,
  nota,
}: {
  titulo: string;
  valor: string;
  Icono: typeof Store;
  hoy?: number;
  ayer?: number;
  nota?: string;
}) {
  const cambio = hoy !== undefined && ayer ? Math.round(((hoy - ayer) / ayer) * 100) : null;
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-borde bg-white p-4 sm:flex-row sm:items-start md:p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-vino-900 text-dorado-300 md:size-12">
        <Icono aria-hidden size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-suave">{titulo}</p>
        <p className="font-display text-2xl font-extrabold tabular-nums md:text-3xl">{valor}</p>
        {cambio !== null ? (
          <p className={`text-xs font-semibold ${cambio >= 0 ? "text-abierto" : "text-vino-600"}`}>
            {cambio >= 0 ? "▲" : "▼"} {Math.abs(cambio)}% <span className="font-normal text-suave">vs ayer</span>
          </p>
        ) : (
          <p className="text-xs text-suave">{nota ?? (hoy !== undefined ? "Ayer sin movimiento" : "")}</p>
        )}
      </div>
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
