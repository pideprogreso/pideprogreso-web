import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerPedidosNegocio, requerirNegocio, separarPedidos } from "@/lib/panel";
import { Actualizador } from "../pedidos/[id]/actualizador";
import { AvisoPedidos } from "./aviso-pedidos";
import { TarjetaPedido } from "./tarjeta-pedido";

export const metadata: Metadata = { title: "Pedidos" };

export default function PaginaPanel() {
  return (
    <Suspense fallback={<Cargando />}>
      <Pedidos />
    </Suspense>
  );
}

async function Pedidos() {
  const negocio = await requerirNegocio();
  const { nuevos, enCurso, terminados, ahora } = separarPedidos(await obtenerPedidosNegocio(negocio.id));

  return (
    <div className="space-y-8 pt-6 md:pt-8">
      <Actualizador cadaMs={10000} />
      <AvisoPedidos nuevos={nuevos.map((p) => p.id)} />

      {nuevos.length + enCurso.length === 0 && (
        <div className="rounded-3xl bg-superficie px-6 py-12 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-white">
            <Inbox aria-hidden size={28} />
          </span>
          <p className="mt-4 font-display text-xl font-bold">Sin pedidos por ahora</p>
          <p className="mx-auto mt-1 max-w-xs text-suave">
            {negocio.abierto
              ? "Deja esta pantalla abierta: cuando llegue un pedido sonará y aparecerá aquí."
              : "Tu negocio está cerrado. Actívalo arriba para recibir pedidos."}
          </p>
        </div>
      )}

      {nuevos.length > 0 && (
        <Grupo titulo="Nuevos" cuenta={nuevos.length} resaltado>
          {nuevos.map((p) => (
            <TarjetaPedido key={p.id} pedido={p} ahora={ahora} />
          ))}
        </Grupo>
      )}
      {enCurso.length > 0 && (
        <Grupo titulo="En curso" cuenta={enCurso.length}>
          {enCurso.map((p) => (
            <TarjetaPedido key={p.id} pedido={p} ahora={ahora} />
          ))}
        </Grupo>
      )}
      {terminados.length > 0 && (
        <Grupo titulo="Últimas 24 horas" cuenta={terminados.length}>
          {terminados.map((p) => (
            <TarjetaPedido key={p.id} pedido={p} ahora={ahora} compacta />
          ))}
        </Grupo>
      )}
    </div>
  );
}

function Grupo({
  titulo,
  cuenta,
  resaltado = false,
  children,
}: {
  titulo: string;
  cuenta: number;
  resaltado?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        {titulo}
        <span
          className={`rounded-full px-2 py-0.5 text-sm tabular-nums ${
            resaltado ? "bg-vino-700 text-white" : "bg-superficie text-suave"
          }`}
        >
          {cuenta}
        </span>
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Cargando() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2" aria-busy="true" aria-label="Cargando pedidos">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-2xl bg-superficie" />
      ))}
    </div>
  );
}
