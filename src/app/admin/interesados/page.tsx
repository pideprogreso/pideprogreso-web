import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerInteresados, requerirAdmin } from "@/lib/admin";
import { BotonContactado } from "./boton-contactado";

export const metadata: Metadata = { title: "Interesados · Administración" };

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Matamoros",
});

export default function PaginaInteresados() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-superficie" />}>
      <Lista />
    </Suspense>
  );
}

async function Lista() {
  await requerirAdmin();
  const interesados = await obtenerInteresados();
  const pendientes = interesados.filter((i) => !i.contactado).length;

  if (interesados.length === 0)
    return <p className="mt-8 text-suave">Aún no se registra ningún negocio en /proximamente.</p>;

  return (
    <div className="pt-6">
      <p className="text-suave">
        {pendientes === 0 ? "Ya contactaste a todos." : `${pendientes} por contactar.`}
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {interesados.map((i) => (
          <li
            key={i.id}
            className={`flex flex-col rounded-2xl border-2 p-4 ${i.contactado ? "border-borde opacity-60" : "border-vino-700"}`}
          >
            <p className="text-sm text-suave">
              {fecha.format(new Date(i.creado_en))} · {i.giro}
            </p>
            <p className="mt-1 font-display text-lg font-bold">{i.negocio}</p>
            <p className="text-[15px]">{i.nombre}</p>
            <p className="mt-2 flex flex-wrap gap-x-3 text-sm font-semibold text-vino-700">
              <a href={`https://wa.me/${i.telefono.replace("+", "").replace(/^(\d{10})$/, "52$1")}`} target="_blank" rel="noreferrer">
                WhatsApp {i.telefono}
              </a>
              {i.correo && <a href={`mailto:${i.correo}`}>{i.correo}</a>}
            </p>
            <div className="mt-auto pt-3">
              <BotonContactado id={i.id} contactado={i.contactado} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
