import { ChevronRight, LogOut, Receipt, ShieldCheck, Store } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { esAdmin } from "@/lib/admin";
import { obtenerMiNegocio } from "@/lib/panel";
import { BotonGoogle } from "@/components/boton-google";
import { obtenerDatosCliente } from "@/lib/cliente";
import { obtenerUsuario } from "@/lib/sesion";
import { BorrarDireccion } from "./borrar-direccion";
import { salir } from "../entrar/acciones";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function PaginaCuenta() {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8">
      <h1 className="pt-6 font-display text-[28px] font-extrabold tracking-[-0.02em] md:pt-10 md:text-[36px]">
        Mi cuenta
      </h1>
      <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-3xl bg-superficie" />}>
        <Contenido />
      </Suspense>
    </div>
  );
}

async function Contenido() {
  const usuario = await obtenerUsuario();

  if (!usuario || usuario.anonimo) {
    return (
      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <p className="text-suave">Entra para pedir, guardar tus direcciones y seguir tus pedidos.</p>
          <BotonGoogle siguiente="/cuenta" />
          <Link
            href="/entrar?siguiente=/cuenta"
            className="flex h-14 items-center justify-center rounded-full border border-borde font-semibold hover:bg-superficie"
          >
            Usar mi correo
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-vino-900 text-white">
          <Image src="/demo/tacos-2.jpg" alt="" fill sizes="(min-width: 768px) 672px, 100vw" className="object-cover opacity-35" />
          <div className="relative px-6 py-8">
            <p className="text-sm font-bold uppercase tracking-wider text-dorado-300">Para negocios</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">
              Recibe pedidos de todo Nuevo Progreso
            </h2>
            <p className="mt-2 max-w-sm text-white/85">
              Sube tu menú, recibe pedidos en tu celular y avisa a tus clientes cuándo están listos.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/registro-negocio"
                className="inline-flex h-12 items-center rounded-full bg-white px-6 font-semibold text-foreground"
              >
                Registrar mi negocio
              </Link>
              <Link
                href="/entrar?siguiente=/panel"
                className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 font-semibold"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const [negocio, admin, cliente] = await Promise.all([obtenerMiNegocio(), esAdmin(), obtenerDatosCliente()]);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-vino-700 font-display text-xl font-bold text-white">
          {(usuario.nombre || usuario.email || "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{usuario.nombre || "Sin nombre"}</p>
          <p className="truncate text-sm text-suave">{usuario.email}</p>
        </div>
      </div>

      <div className="divide-y divide-borde rounded-2xl border border-borde">
        {admin && (
          <Fila href="/admin" icono={<ShieldCheck aria-hidden size={22} />} titulo="Administración" detalle="Aprobar negocios y ver pedidos" />
        )}
        {negocio ? (
          <Fila href="/panel" icono={<Store aria-hidden size={22} />} titulo="Mi negocio" detalle={negocio.nombre} />
        ) : (
          <Fila
            href="/registro-negocio"
            icono={<Store aria-hidden size={22} />}
            titulo="Registrar mi negocio"
            detalle="Empieza a recibir pedidos"
          />
        )}
        <Fila href="/pedidos" icono={<Receipt aria-hidden size={22} />} titulo="Mis pedidos" detalle="Pedidos que hiciste como cliente" />
      </div>

      {cliente && cliente.direcciones.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold">Mis direcciones</h2>
          <ul className="mt-3 divide-y divide-borde rounded-2xl border border-borde">
            {cliente.direcciones.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{d.etiqueta}</span>
                  <span className="block truncate text-sm text-suave">{d.direccion}</span>
                </span>
                <BorrarDireccion id={d.id} etiqueta={d.etiqueta} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <form action={salir}>
        <button
          type="submit"
          className="inline-flex h-12 items-center gap-2 rounded-full border border-borde px-5 font-semibold hover:bg-superficie"
        >
          <LogOut aria-hidden size={18} />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

function Fila({
  href,
  icono,
  titulo,
  detalle,
}: {
  href: string;
  icono: React.ReactNode;
  titulo: string;
  detalle: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-4 px-4 py-4 hover:bg-superficie/60">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-superficie">{icono}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{titulo}</span>
        <span className="block truncate text-sm text-suave">{detalle}</span>
      </span>
      <ChevronRight aria-hidden size={18} className="text-suave" />
    </Link>
  );
}
