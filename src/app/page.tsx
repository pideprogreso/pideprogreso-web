import Image from "next/image";
import Link from "next/link";
import { CarruselCategorias } from "@/components/carrusel-categorias";
import { FilaNegocios } from "@/components/fila-negocios";
import { TarjetaNegocio } from "@/components/tarjeta-negocio";
import { obtenerNegocios } from "@/lib/datos";

export default async function Inicio() {
  const negocios = await obtenerNegocios();
  const abiertos = negocios.filter((n) => n.abierto);
  const gratis = abiertos.filter((n) => n.aceptaEntrega && n.costoEnvio === 0);
  const rapidos = [...abiertos].sort((a, b) => a.tiempoMax - b.tiempoMax).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="relative mt-1 h-[260px] overflow-hidden rounded-3xl bg-vino-900 text-white md:mt-8 md:h-[380px]">
        <Image
          src="/demo/mesa.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/5 md:bg-gradient-to-r md:from-black/75 md:via-black/30" />
        <div className="relative flex h-full flex-col justify-end p-5 md:max-w-xl md:justify-center md:p-12">
          <h1 className="font-display text-[34px] font-extrabold leading-[0.98] tracking-[-0.03em] md:text-[56px]">
            Lo de Nuevo Progreso, hasta tu puerta.
          </h1>
          <p className="mt-3 max-w-sm text-[15px] text-white/85 md:text-lg">
            Pide a las taquerías, panaderías y tiendas de aquí. Pagas en efectivo o por transferencia.
          </p>
          <Link
            href="/negocios"
            className="mt-5 hidden h-12 w-fit items-center rounded-full bg-white px-6 font-semibold text-foreground hover:bg-dorado-300 md:inline-flex"
          >
            Ver todos los negocios
          </Link>
        </div>
      </section>

      <section aria-label="Categorías" className="mt-7 md:mt-10">
        <CarruselCategorias />
      </section>

      {negocios.length === 0 ? (
        <SinNegocios />
      ) : (
        <>
          <FilaNegocios
            titulo="Sin costo de envío"
            descripcion="Pide y no pagas la entrega."
            negocios={gratis}
            prioridad
          />
          <FilaNegocios
            titulo="Llegan rápido"
            descripcion="Los que tardan menos en entregar."
            negocios={rapidos}
            verTodos="/negocios"
            prioridad={gratis.length === 0}
          />

          <section className="mt-10 md:mt-14">
            <h2 className="font-display text-[22px] font-bold leading-tight tracking-tight md:text-[28px]">
              Todos los negocios
            </h2>
            <ul className="mt-4 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {negocios.map((n) => (
                <li key={n.id}>
                  <TarjetaNegocio negocio={n} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <InvitacionNegocios />
    </div>
  );
}

function SinNegocios() {
  return (
    <section className="mt-12 rounded-3xl bg-superficie px-6 py-14 text-center">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        Los primeros negocios están por llegar
      </h2>
      <p className="mx-auto mt-2 max-w-md text-suave">
        Estamos invitando a las taquerías, panaderías y tiendas de Nuevo Progreso. Si tienes un
        negocio, puedes ser de los primeros.
      </p>
      <Link
        href="/registro-negocio"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-vino-700 px-6 font-semibold text-white hover:bg-vino-800"
      >
        Registrar mi negocio
      </Link>
    </section>
  );
}

function InvitacionNegocios() {
  return (
    <section className="mt-14 grid overflow-hidden rounded-3xl bg-vino-700 text-white md:mt-20 md:grid-cols-2">
      <div className="p-6 md:p-12">
        <h2 className="font-display text-[28px] font-extrabold leading-[1.02] tracking-[-0.02em] md:text-[40px]">
          Tu negocio, en el celular de todo Nuevo Progreso.
        </h2>
        <p className="mt-3 max-w-md text-vino-100">
          Sube tu menú con fotos y precios, recibe pedidos y avisa a tus clientes cuando estén
          listos.
        </p>
        <Link
          href="/registro-negocio"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-dorado-400 px-6 font-semibold text-foreground hover:bg-dorado-300"
        >
          Registrar mi negocio
        </Link>
      </div>
      <div className="relative hidden min-h-64 md:block">
        <Image src="/demo/tacos-2.jpg" alt="" fill sizes="600px" className="object-cover" />
      </div>
    </section>
  );
}
