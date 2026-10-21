import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerReportes, requerirAdmin } from "@/lib/admin";
import { BotonResuelto } from "./boton-resuelto";

export const metadata: Metadata = { title: "Reportes · Administración" };

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Matamoros",
});

export default function PaginaReportes() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-superficie" />}>
      <Lista />
    </Suspense>
  );
}

async function Lista() {
  await requerirAdmin();
  const reportes = await obtenerReportes();
  const pendientes = reportes.filter((r) => !r.resuelto).length;

  if (reportes.length === 0) return <p className="mt-8 text-suave">Nadie ha reportado problemas todavía.</p>;

  return (
    <div className="pt-6">
      <p className="text-suave">
        {pendientes === 0 ? "Todo resuelto." : `${pendientes} ${pendientes === 1 ? "reporte pendiente" : "reportes pendientes"}.`}
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {reportes.map((r) => (
          <li
            key={r.id}
            className={`flex flex-col rounded-2xl border-2 p-4 ${r.resuelto ? "border-borde opacity-60" : "border-vino-700"}`}
          >
            <p className="text-sm text-suave">
              {fecha.format(new Date(r.creadoEn))} · <code className="text-foreground">{r.pagina}</code>
            </p>
            <p className="mt-2 whitespace-pre-line text-[15px]">{r.texto}</p>
            <p className="mt-2 text-sm text-suave">
              {r.usuario ?? "Sin cuenta"}
              {r.contacto && <> · {r.contacto}</>}
            </p>
            {r.navegador && <p className="mt-1 truncate text-xs text-suave" title={r.navegador}>{r.navegador}</p>}
            <div className="mt-auto pt-3">
              <BotonResuelto id={r.id} resuelto={r.resuelto} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
