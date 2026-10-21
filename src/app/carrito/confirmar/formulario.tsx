"use client";

import { ArrowLeft, Banknote, Bike, CreditCard, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { confirmarPedido } from "@/app/pedidos/acciones";
import { useCarrito } from "@/components/carrito/proveedor";
import { Campo, estiloCampo } from "@/components/campos";
import type { MetodoPago, Modalidad } from "@/lib/estados";
import { dinero } from "@/lib/formato";

const CLAVE_CONTACTO = "pideprogreso:contacto";

type Contacto = { nombre: string; telefono: string; direccion: string };

export function FormularioConfirmar() {
  const router = useRouter();
  const { carrito, subtotal, vaciar } = useCarrito();
  const negocio = carrito.negocio;

  const [modalidadElegida, setModalidad] = useState<Modalidad>("entrega");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo");
  const [contacto, setContacto] = useState<Contacto>({ nombre: "", telefono: "", direccion: "" });
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  useEffect(() => {
    // Recuerda los datos del último pedido en este dispositivo.
    try {
      const guardado = localStorage.getItem(CLAVE_CONTACTO);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (guardado) setContacto({ nombre: "", telefono: "", direccion: "", ...JSON.parse(guardado) });
    } catch {}
  }, []);

  if (!negocio || carrito.lineas.length === 0) {
    return (
      <div className="px-6 pt-20 text-center">
        <h1 className="font-display text-2xl font-bold">No hay nada que confirmar</h1>
        <p className="mt-2 text-suave">Tu pedido está vacío.</p>
        <Link
          href="/negocios"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-foreground px-6 font-semibold text-white"
        >
          Ver negocios
        </Link>
      </div>
    );
  }

  // Si el negocio solo ofrece una modalidad, esa es la que cuenta.
  const modalidad: Modalidad = !negocio.aceptaEntrega
    ? "recoger"
    : !negocio.aceptaRecoger
      ? "entrega"
      : modalidadElegida;
  const envio = modalidad === "entrega" ? negocio.costoEnvio : 0;
  const total = subtotal + envio;
  const faltaMinimo = negocio.pedidoMinimo - subtotal;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!negocio) return;
    setError(null);
    iniciar(async () => {
      const r = await confirmarPedido({
        negocioId: negocio.id,
        modalidad,
        metodoPago,
        nombre: contacto.nombre,
        telefono: contacto.telefono,
        direccion: contacto.direccion,
        notas,
        productos: carrito.lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      try {
        localStorage.setItem(CLAVE_CONTACTO, JSON.stringify(contacto));
      } catch {}
      vaciar();
      router.replace(`/pedidos/${r.id}?nuevo=1`);
    });
  }

  const campo = (k: keyof Contacto) => ({
    value: contacto[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setContacto((c) => ({ ...c, [k]: e.target.value })),
  });

  return (
    <form onSubmit={enviar} className="mx-auto max-w-5xl px-4 md:px-8">
      <header className="flex items-center gap-3 pt-4 md:pt-10">
        <Link
          href="/carrito"
          aria-label="Volver a mi pedido"
          className="grid size-10 place-items-center rounded-full bg-superficie"
        >
          <ArrowLeft aria-hidden size={20} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
            Confirmar pedido
          </h1>
          <p className="truncate text-sm text-suave">{negocio.nombre}</p>
        </div>
      </header>

      <div className="mt-6 md:grid md:grid-cols-[1fr_340px] md:gap-10">
        <div className="space-y-8">
          <fieldset>
            <legend className="font-display text-xl font-bold">¿Cómo lo quieres?</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Opcion
                nombre="modalidad"
                activa={modalidad === "entrega"}
                deshabilitada={!negocio.aceptaEntrega}
                onElegir={() => setModalidad("entrega")}
                icono={<Bike aria-hidden size={22} />}
                titulo="A domicilio"
                detalle={
                  !negocio.aceptaEntrega
                    ? "No disponible"
                    : negocio.costoEnvio === 0
                      ? "Envío gratis"
                      : `Envío ${dinero(negocio.costoEnvio)}`
                }
              />
              <Opcion
                nombre="modalidad"
                activa={modalidad === "recoger"}
                deshabilitada={!negocio.aceptaRecoger}
                onElegir={() => setModalidad("recoger")}
                icono={<Store aria-hidden size={22} />}
                titulo="Paso a recoger"
                detalle={negocio.aceptaRecoger ? "Sin costo" : "No disponible"}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-display text-xl font-bold">Tus datos</legend>
            <Campo etiqueta="Nombre" id="nombre">
              <input id="nombre" autoComplete="name" required maxLength={120} {...campo("nombre")} className={estiloCampo} />
            </Campo>
            <Campo etiqueta="Celular" id="telefono" ayuda="Para que el negocio te avise o te llame.">
              <input
                id="telefono"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                required
                placeholder="899 123 4567"
                maxLength={14}
                {...campo("telefono")}
                className={estiloCampo}
              />
            </Campo>
            {modalidad === "entrega" && (
              <Campo etiqueta="Dirección de entrega" id="direccion" ayuda="Calle, número, colonia y una referencia.">
                <textarea
                  id="direccion"
                  required
                  rows={2}
                  maxLength={300}
                  autoComplete="street-address"
                  {...campo("direccion")}
                  className={`${estiloCampo} h-auto py-3`}
                />
              </Campo>
            )}
            <Campo etiqueta="Notas para el negocio (opcional)" id="notas">
              <textarea
                id="notas"
                rows={2}
                maxLength={500}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Sin cebolla, salsa aparte…"
                className={`${estiloCampo} h-auto py-3`}
              />
            </Campo>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl font-bold">¿Cómo vas a pagar?</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Opcion
                nombre="pago"
                activa={metodoPago === "efectivo"}
                onElegir={() => setMetodoPago("efectivo")}
                icono={<Banknote aria-hidden size={22} />}
                titulo="Efectivo"
                detalle={modalidad === "entrega" ? "Al recibir" : "Al recoger"}
              />
              <Opcion
                nombre="pago"
                activa={metodoPago === "transferencia"}
                onElegir={() => setMetodoPago("transferencia")}
                icono={<CreditCard aria-hidden size={22} />}
                titulo="Transferencia"
                detalle="Te damos los datos"
              />
            </div>
          </fieldset>
        </div>

        <aside className="mt-8 md:mt-0">
          <div className="rounded-2xl border border-borde p-5 md:sticky md:top-[100px]">
            <h2 className="font-display text-xl font-bold">Resumen</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {carrito.lineas.map((l) => (
                <li key={l.productoId} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">
                    <span className="font-semibold tabular-nums">{l.cantidad}×</span> {l.nombre}
                  </span>
                  <span className="shrink-0 tabular-nums">{dinero(l.precio * l.cantidad)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-borde pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-suave">Productos</dt>
                <dd className="tabular-nums">{dinero(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-suave">Envío</dt>
                <dd className="tabular-nums">
                  {modalidad === "recoger" ? "No aplica" : envio === 0 ? "Gratis" : dinero(envio)}
                </dd>
              </div>
              <div className="flex justify-between pt-2 font-display text-xl font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{dinero(total)}</dd>
              </div>
            </dl>

            {faltaMinimo > 0 && (
              <p className="mt-4 rounded-xl bg-dorado-100 px-3 py-2 text-sm text-dorado-800">
                El pedido mínimo es de {dinero(negocio.pedidoMinimo)}. Te faltan {dinero(faltaMinimo)}.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-vino-50 px-3 py-2 text-sm font-medium text-vino-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando || faltaMinimo > 0}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
            >
              {enviando ? "Enviando pedido…" : `Enviar pedido de ${dinero(total)}`}
            </button>
            <p className="mt-3 text-center text-xs text-suave">
              El negocio confirma tu pedido y te avisa cuando esté listo.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Opcion({
  nombre,
  activa,
  deshabilitada = false,
  onElegir,
  icono,
  titulo,
  detalle,
}: {
  nombre: string;
  activa: boolean;
  deshabilitada?: boolean;
  onElegir: () => void;
  icono: React.ReactNode;
  titulo: string;
  detalle: string;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-vino-700 ${
        activa ? "border-foreground bg-superficie" : "border-borde hover:border-superficie-2"
      } ${deshabilitada ? "pointer-events-none opacity-40" : ""}`}
    >
      <input
        type="radio"
        name={nombre}
        checked={activa}
        disabled={deshabilitada}
        onChange={onElegir}
        className="sr-only"
      />
      {icono}
      <span className="font-semibold leading-tight">{titulo}</span>
      <span className="text-sm text-suave">{detalle}</span>
    </label>
  );
}
