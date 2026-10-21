import { MapPin, Phone, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FotoNegocio } from "@/components/foto";
import {
  inicioDeHoy,
  obtenerNegociosAdmin,
  obtenerPedidosAdmin,
  obtenerReportes,
  requerirAdmin,
  type NegocioAdmin,
} from "@/lib/admin";
import { buscarCategoria } from "@/lib/categorias";
import { ESTADOS_FINALES } from "@/lib/estados";
import { dinero } from "@/lib/formato";
import { BotonEstadoNegocio } from "./boton-estado-negocio";

export const metadata: Metadata = { title: "Administración" };

const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "America/Matamoros" });

export default function PaginaAdmin() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-superficie" />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  await requerirAdmin();
  const [negocios, pedidos, reportes] = await Promise.all([
    obtenerNegociosAdmin(),
    obtenerPedidosAdmin(),
    obtenerReportes(),
  ]);
  const reportesPendientes = reportes.filter((r) => !r.resuelto).length;
  const hoy = inicioDeHoy();
  const deHoy = pedidos.filter((p) => p.creadoEn >= hoy);
  const entregados = deHoy.filter((p) => p.estado === "entregado");

  const pendientes = negocios.filter((n) => n.estado === "pendiente");
  const aprobados = negocios.filter((n) => n.estado === "aprobado");
  const suspendidos = negocios.filter((n) => n.estado === "suspendido");

  return (
    <div className="space-y-10 pt-6">
      {reportesPendientes > 0 && (
        <Link
          href="/admin/reportes"
          className="block rounded-2xl bg-dorado-100 px-4 py-3 text-sm font-semibold text-dorado-800"
        >
          Hay {reportesPendientes} {reportesPendientes === 1 ? "reporte de problema pendiente" : "reportes de problemas pendientes"}. Verlos →
        </Link>
      )}
      <section aria-label="Hoy" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Dato titulo="Pedidos hoy" valor={String(deHoy.length)} />
        <Dato titulo="En curso" valor={String(deHoy.filter((p) => !ESTADOS_FINALES.includes(p.estado)).length)} />
        <Dato titulo="Vendido hoy" valor={dinero(entregados.reduce((s, p) => s + p.total, 0))} ayuda="Pedidos entregados" />
        <Dato titulo="Negocios abiertos" valor={`${aprobados.filter((n) => n.abierto).length} de ${aprobados.length}`} />
      </section>

      <Grupo titulo="Por aprobar" cuenta={pendientes.length} resaltado vacio="No hay solicitudes nuevas.">
        {pendientes.map((n) => (
          <Tarjeta key={n.id} negocio={n} />
        ))}
      </Grupo>
      <Grupo titulo="Publicados" cuenta={aprobados.length} vacio="Aún no hay negocios publicados.">
        {aprobados.map((n) => (
          <Tarjeta key={n.id} negocio={n} />
        ))}
      </Grupo>
      {suspendidos.length > 0 && (
        <Grupo titulo="Suspendidos" cuenta={suspendidos.length} vacio="">
          {suspendidos.map((n) => (
            <Tarjeta key={n.id} negocio={n} />
          ))}
        </Grupo>
      )}
    </div>
  );
}

function Dato({ titulo, valor, ayuda }: { titulo: string; valor: string; ayuda?: string }) {
  return (
    <div className="rounded-2xl bg-superficie px-4 py-4">
      <p className="text-sm text-suave">{titulo}</p>
      <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{valor}</p>
      {ayuda && <p className="text-xs text-suave">{ayuda}</p>}
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
        <div className="mt-3 grid gap-4 md:grid-cols-2">{children}</div>
      )}
    </section>
  );
}

function Tarjeta({ negocio: n }: { negocio: NegocioAdmin }) {
  return (
    <article className={`flex flex-col rounded-2xl border-2 p-4 ${n.estado === "pendiente" ? "border-vino-700" : "border-borde"}`}>
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
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {n.estado === "pendiente" && (
          <>
            <BotonEstadoNegocio id={n.id} estado="suspendido" texto="Rechazar" nombre={n.nombre} />
            <BotonEstadoNegocio id={n.id} estado="aprobado" texto="Aprobar y publicar" nombre={n.nombre} principal />
          </>
        )}
        {n.estado === "aprobado" && (
          <>
            <Link href={`/negocios/${n.slug}`} className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold hover:bg-superficie">
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
