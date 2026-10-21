import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { dinero } from "@/lib/formato";
import { obtenerPedidosNegocio, requerirNegocio, separarPedidos } from "@/lib/panel";
import { Actualizador } from "../pedidos/[id]/actualizador";
import { AvisoPedidos } from "./aviso-pedidos";
import { BotonPausa } from "./boton-pausa";
import { TarjetaPedido } from "./tarjeta-pedido";
import { VistasPedidos } from "./vistas-pedidos";

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
  const { nuevos, enCocina, listos, terminados, hoy, ahora } = separarPedidos(await obtenerPedidosNegocio(negocio.id));

  return (
    <div className="space-y-5 pt-5 md:pt-8">
      <Actualizador cadaMs={10000} />
      <AvisoPedidos
        nuevos={nuevos.map((p) => ({ id: p.id, folio: p.folio, nombre: p.nombreContacto, total: dinero(p.total) }))}
      />

      <dl className="grid grid-cols-3 rounded-2xl bg-superficie py-3 text-center">
        <Dato valor={String(hoy.pedidos)} texto="Pedidos hoy" />
        <Dato valor={dinero(hoy.total)} texto="Vendido hoy" />
        <Dato valor={String(nuevos.length + enCocina.length + listos.length)} texto="En curso" />
      </dl>

      {negocio.abierto && (
        <BotonPausa hasta={negocio.pausadoHasta && new Date(negocio.pausadoHasta).getTime() > ahora ? negocio.pausadoHasta : null} />
      )}

      <VistasPedidos
        vacio={
          <div className="rounded-3xl bg-superficie px-6 py-12 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-white">
              <Inbox aria-hidden size={28} />
            </span>
            <p className="mt-4 font-display text-xl font-bold">Nada por aquí</p>
            <p className="mx-auto mt-1 max-w-xs text-suave">
              {negocio.abierto
                ? "Deja esta pantalla abierta: cuando llegue un pedido sonará y aparecerá en Nuevos."
                : "Tu negocio está cerrado. Actívalo arriba para recibir pedidos."}
            </p>
          </div>
        }
        vistas={[
          {
            clave: "nuevos",
            texto: "Nuevos",
            cuenta: nuevos.length,
            resaltada: true,
            contenido: nuevos.map((p) => <TarjetaPedido key={p.id} pedido={p} ahora={ahora} modo="nuevo" />),
          },
          {
            clave: "cocina",
            texto: "En cocina",
            cuenta: enCocina.length,
            contenido: enCocina.map((p) => <TarjetaPedido key={p.id} pedido={p} ahora={ahora} modo="fila" />),
          },
          {
            clave: "listos",
            texto: "Listos",
            cuenta: listos.length,
            contenido: listos.map((p) => <TarjetaPedido key={p.id} pedido={p} ahora={ahora} modo="fila" />),
          },
          {
            clave: "historial",
            texto: "Últimas 24 h",
            cuenta: terminados.length,
            contenido: terminados.map((p) => <TarjetaPedido key={p.id} pedido={p} ahora={ahora} modo="historial" />),
          },
        ]}
      />
    </div>
  );
}

function Dato({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-suave">{texto}</dt>
      <dd className="font-display text-lg font-bold tabular-nums">{valor}</dd>
    </div>
  );
}

function Cargando() {
  return (
    <div className="mt-5 space-y-4" aria-busy="true" aria-label="Cargando pedidos">
      <div className="h-20 animate-pulse rounded-2xl bg-superficie" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-superficie" />
        ))}
      </div>
    </div>
  );
}
