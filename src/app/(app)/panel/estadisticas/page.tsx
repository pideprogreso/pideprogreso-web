import { Ban, Bike, ChartLine, Clock, ReceiptText, ShoppingBag, Utensils } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { COLORES_DONA, Dato, Dona, Grafica, Panel, ultimosDias } from "@/components/tablero";
import { dinero } from "@/lib/formato";
import { BotonCompartir } from "./boton-compartir";
import { obtenerEstadisticasNegocio, requerirNegocio, type PedidoEstadistica } from "@/lib/panel";

export const metadata: Metadata = { title: "Estadísticas" };

const zona = "America/Matamoros";
const claveDia = new Intl.DateTimeFormat("en-CA", { timeZone: zona });
const horaLocal = new Intl.DateTimeFormat("en-US", { timeZone: zona, hour: "numeric", hourCycle: "h23" });
const nombreMes = new Intl.DateTimeFormat("es-MX", { month: "long", timeZone: zona });
const CUOTA = 149; // cuota mensual vigente
const perdido = (p: PedidoEstadistica) => p.estado === "cancelado" || p.estado === "rechazado";

export default function PaginaEstadisticas() {
  return (
    <Suspense fallback={<div className="mt-5 h-96 animate-pulse rounded-3xl bg-superficie md:mt-8" aria-busy="true" />}>
      <Contenido />
    </Suspense>
  );
}

// Resumen de un periodo: los cancelados y rechazados no cuentan como venta.
function resumir(pedidos: PedidoEstadistica[]) {
  const entregados = pedidos.filter((p) => p.estado === "entregado");
  const vendido = entregados.reduce((s, p) => s + p.total, 0);
  return {
    pedidos: pedidos.filter((p) => !perdido(p)).length,
    vendido,
    ticket: entregados.length ? vendido / entregados.length : 0,
    perdidos: pedidos.filter(perdido).length,
  };
}

async function Contenido() {
  const negocio = await requerirNegocio("/panel/estadisticas");
  const pedidos = await obtenerEstadisticasNegocio(negocio.id);

  const hoy = claveDia.format(new Date()); // "2026-11-13"
  const mesActual = hoy.slice(0, 7);
  const [anio, mes] = mesActual.split("-").map(Number);
  const mesPasado = `${mes === 1 ? anio - 1 : anio}-${String(mes === 1 ? 12 : mes - 1).padStart(2, "0")}`;
  const diaDelMes = hoy.slice(8);
  const dia = (p: PedidoEstadistica) => claveDia.format(new Date(p.creadoEn));

  const deEsteMes = pedidos.filter((p) => dia(p).startsWith(mesActual));
  // Mismo tramo del mes pasado (del 1 al día de hoy) para que la comparación sea justa.
  const delMesPasado = pedidos.filter((p) => dia(p).startsWith(mesPasado) && dia(p).slice(8) <= diaDelMes);
  const actual = resumir(deEsteMes);
  const antes = resumir(delMesPasado);

  const productos = new Map<string, { cantidad: number; importe: number }>();
  for (const p of deEsteMes.filter((p) => !perdido(p))) {
    for (const d of p.productos) {
      const v = productos.get(d.nombre) ?? { cantidad: 0, importe: 0 };
      productos.set(d.nombre, { cantidad: v.cantidad + d.cantidad, importe: v.importe + d.importe });
    }
  }
  const topProductos = [...productos].sort((a, b) => b[1].cantidad - a[1].cantidad).slice(0, 5);
  const maxProducto = topProductos[0]?.[1].cantidad ?? 1;

  const porHora = Array.from({ length: 24 }, () => 0);
  for (const p of deEsteMes) porHora[Number(horaLocal.format(new Date(p.creadoEn)))]++;
  const conPedidos = porHora.flatMap((n, h) => (n ? [h] : []));
  const horas = conPedidos.length ? porHora.slice(conPedidos[0], conPedidos.at(-1)! + 1).map((n, i) => ({ h: conPedidos[0] + i, n })) : [];
  const maxHora = Math.max(1, ...porHora);

  const modalidades = [
    { nombre: "A domicilio", pedidos: deEsteMes.filter((p) => !perdido(p) && p.modalidad === "entrega").length, color: COLORES_DONA[1] },
    { nombre: "Pasan a recoger", pedidos: deEsteMes.filter((p) => !perdido(p) && p.modalidad === "recoger").length, color: COLORES_DONA[2] },
  ];
  const dias = ultimosDias(pedidos.filter((p) => !perdido(p)), 30);
  const contra = `vs ${nombreMes.format(new Date(`${mesPasado}-15T12:00:00Z`))}`;

  return (
    <div className="space-y-6 pt-5 md:pt-8">
      <section className="relative overflow-hidden rounded-3xl bg-vino-900 p-6 text-white md:p-8">
        <p className="text-sm font-bold uppercase tracking-wider text-dorado-300">
          En {nombreMes.format(new Date(`${mesActual}-15T12:00:00Z`))}, PideProgreso te trajo
        </p>
        <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-dorado-400 md:text-6xl">{dinero(actual.vendido)}</p>
        <p className="mt-2 text-white/80">
          en {actual.pedidos} {actual.pedidos === 1 ? "pedido" : "pedidos"}
          {actual.vendido >= CUOTA * 2 && `: ${Math.floor(actual.vendido / CUOTA)} veces lo que pagas de cuota`}
          {actual.pedidos === 0 && ". Comparte tu página para recibir tus primeros pedidos."}
        </p>
        <div className="mt-5">
          <BotonCompartir />
        </div>
      </section>

      <section aria-label="Este mes" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Dato titulo="Pedidos" valor={String(actual.pedidos)} Icono={ShoppingBag} hoy={actual.pedidos} ayer={antes.pedidos} contra={contra} />
        <Dato titulo="Ticket promedio" valor={dinero(actual.ticket)} Icono={ReceiptText} hoy={actual.ticket} ayer={antes.ticket} contra={contra} />
        <Dato
          className="col-span-2 lg:col-span-1"
          titulo="Cancelados"
          valor={String(actual.perdidos)}
          Icono={Ban}
          nota={actual.perdidos === 0 ? "¡Ninguno este mes!" : "Cancelados o rechazados"}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel titulo="Pedidos de los últimos 30 días" Icono={ChartLine}>
          <Grafica dias={dias} />
        </Panel>
        <Panel titulo="Cómo te piden" Icono={Bike}>
          <Dona categorias={modalidades} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel titulo="Lo más vendido del mes" Icono={Utensils}>
          {topProductos.length === 0 ? (
            <p className="text-suave">Cuando lleguen pedidos verás aquí tus productos estrella.</p>
          ) : (
            <ol className="space-y-3">
              {topProductos.map(([nombre, v], i) => (
                <li key={nombre}>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="w-4 font-bold text-suave tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{nombre}</span>
                    <span className="tabular-nums text-suave">{v.cantidad} vendidos</span>
                    <span className="w-20 text-right font-semibold tabular-nums">{dinero(v.importe)}</span>
                  </div>
                  <span className="ml-6 mt-1 block h-2 overflow-hidden rounded-full bg-superficie">
                    <span
                      className={`block h-full rounded-full ${i === 0 ? "bg-dorado-400" : "bg-vino-700"}`}
                      style={{ width: `${(v.cantidad / maxProducto) * 100}%` }}
                    />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel titulo="Horas con más pedidos" Icono={Clock}>
          {horas.length === 0 ? (
            <p className="text-suave">Aún no hay pedidos este mes.</p>
          ) : (
            <ol className="flex h-44 items-end gap-1" aria-label="Pedidos por hora del día, este mes">
              {horas.map(({ h, n }) => (
                <li key={h} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <span
                    className={`w-full max-w-8 rounded-t-md ${n === maxHora ? "bg-dorado-400" : "bg-vino-700"}`}
                    style={{ height: `${n ? Math.max(4, (n / maxHora) * 100) : 0}%` }}
                    title={`${h}:00 · ${n} ${n === 1 ? "pedido" : "pedidos"}`}
                  />
                  <span className="text-[11px] tabular-nums text-suave">{h}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}
