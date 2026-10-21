"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarNegocio, registrarNegocio, type DatosNegocio } from "@/app/panel/acciones";
import { CATEGORIAS } from "@/lib/categorias";
import { Aviso, Campo, estiloCampo, Interruptor } from "./campos";
import { SubirFoto } from "./subir-foto";

export const NEGOCIO_VACIO: DatosNegocio = {
  nombre: "",
  categoria: "",
  descripcion: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
  horario: "",
  aceptaEntrega: true,
  aceptaRecoger: true,
  costoEnvio: 20,
  pedidoMinimo: 0,
  tiempoMin: 20,
  tiempoMax: 40,
  datosTransferencia: "",
  portadaUrl: null,
  logoUrl: null,
};

// Alta (sin fotos, el negocio aún no existe) o edición desde el panel.
export function FormularioNegocio({
  inicial,
  negocioId,
}: {
  inicial: DatosNegocio;
  negocioId: string | null;
}) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, iniciar] = useTransition();
  const registro = negocioId === null;

  const poner = <K extends keyof DatosNegocio>(k: K, v: DatosNegocio[K]) => {
    setGuardado(false);
    setD((x) => ({ ...x, [k]: v }));
  };
  const textoDe = (k: "nombre" | "descripcion" | "telefono" | "whatsapp" | "direccion" | "horario" | "datosTransferencia") => ({
    value: d[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => poner(k, e.target.value),
  });
  const numeroDe = (k: "costoEnvio" | "pedidoMinimo" | "tiempoMin" | "tiempoMax") => ({
    value: Number.isNaN(d[k]) ? "" : String(d[k]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => poner(k, e.target.value === "" ? NaN : Number(e.target.value)),
  });

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = registro ? await registrarNegocio(d) : await guardarNegocio(d);
      if (!r.ok) return setError(r.error);
      if (registro) {
        router.replace("/panel");
      } else {
        setGuardado(true);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-8">
      <Seccion titulo="Tu negocio">
        {!registro && (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <SubirFoto negocioId={negocioId} valor={d.portadaUrl} onCambio={(v) => poner("portadaUrl", v)} etiqueta="Foto de portada" />
            <SubirFoto negocioId={negocioId} valor={d.logoUrl} onCambio={(v) => poner("logoUrl", v)} etiqueta="Logo" forma="cuadrada" />
          </div>
        )}
        <Campo etiqueta="Nombre del negocio" id="nombre">
          <input id="nombre" required maxLength={120} {...textoDe("nombre")} className={estiloCampo} />
        </Campo>
        <Campo etiqueta="Categoría" id="categoria">
          <select
            id="categoria"
            required
            value={d.categoria}
            onChange={(e) => poner("categoria", e.target.value)}
            className={`${estiloCampo} appearance-none`}
          >
            <option value="" disabled>
              Elige una
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Descripción (opcional)" id="descripcion" ayuda="Qué vendes y qué te hace especial, en una o dos líneas.">
          <textarea id="descripcion" rows={2} maxLength={1000} {...textoDe("descripcion")} className={`${estiloCampo} h-auto py-3`} />
        </Campo>
      </Seccion>

      <Seccion titulo="Contacto y ubicación">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Teléfono" id="telefono">
            <input id="telefono" type="tel" inputMode="numeric" required maxLength={14} placeholder="899 123 4567" {...textoDe("telefono")} className={estiloCampo} />
          </Campo>
          <Campo etiqueta="WhatsApp (opcional)" id="whatsapp">
            <input id="whatsapp" type="tel" inputMode="numeric" maxLength={14} placeholder="899 123 4567" {...textoDe("whatsapp")} className={estiloCampo} />
          </Campo>
        </div>
        <Campo etiqueta="Dirección" id="direccion" ayuda="Calle, número y colonia.">
          <input id="direccion" required maxLength={300} {...textoDe("direccion")} className={estiloCampo} />
        </Campo>
        <Campo etiqueta="Horario" id="horario" ayuda="Por ejemplo: Lunes a sábado, 8:00 a 22:00.">
          <input id="horario" maxLength={300} {...textoDe("horario")} className={estiloCampo} />
        </Campo>
      </Seccion>

      <Seccion titulo="Entregas">
        <div className="divide-y divide-borde rounded-2xl border border-borde">
          <Opcion titulo="Entrega a domicilio" detalle="Tú llevas el pedido al cliente." activo={d.aceptaEntrega} onCambio={(v) => poner("aceptaEntrega", v)} />
          <Opcion titulo="Pasan a recoger" detalle="El cliente recoge en tu negocio." activo={d.aceptaRecoger} onCambio={(v) => poner("aceptaRecoger", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {d.aceptaEntrega && (
            <Campo etiqueta="Costo de envío" id="costoEnvio" ayuda="0 = envío gratis">
              <Pesos id="costoEnvio" {...numeroDe("costoEnvio")} />
            </Campo>
          )}
          <Campo etiqueta="Pedido mínimo" id="pedidoMinimo" ayuda="0 = sin mínimo">
            <Pesos id="pedidoMinimo" {...numeroDe("pedidoMinimo")} />
          </Campo>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Tiempo de entrega aproximado</legend>
          <div className="flex items-center gap-3">
            <input aria-label="Mínimo en minutos" type="number" inputMode="numeric" min={5} max={240} required {...numeroDe("tiempoMin")} className={`${estiloCampo} w-24 text-center`} />
            <span className="text-suave">a</span>
            <input aria-label="Máximo en minutos" type="number" inputMode="numeric" min={5} max={240} required {...numeroDe("tiempoMax")} className={`${estiloCampo} w-24 text-center`} />
            <span className="text-suave">min</span>
          </div>
        </fieldset>
      </Seccion>

      <Seccion titulo="Pago por transferencia">
        <Campo
          etiqueta="Datos para transferencia (opcional)"
          id="datosTransferencia"
          ayuda="Banco, nombre y CLABE o número de tarjeta. Se los mostramos al cliente que elija transferencia."
        >
          <textarea id="datosTransferencia" rows={3} maxLength={300} {...textoDe("datosTransferencia")} className={`${estiloCampo} h-auto py-3`} />
        </Campo>
      </Seccion>

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] -mx-4 space-y-3 border-t border-borde bg-white/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
        {error && <Aviso>{error}</Aviso>}
        <button
          type="submit"
          disabled={enviando}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800 disabled:opacity-50 md:w-auto md:px-10"
        >
          {guardado && <Check aria-hidden size={20} />}
          {enviando ? "Guardando…" : registro ? "Enviar solicitud" : guardado ? "Guardado" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 font-display text-xl font-bold">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Opcion({
  titulo,
  detalle,
  activo,
  onCambio,
}: {
  titulo: string;
  detalle: string;
  activo: boolean;
  onCambio: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{titulo}</p>
        <p className="text-sm text-suave">{detalle}</p>
      </div>
      <Interruptor activo={activo} onCambio={onCambio} etiqueta={titulo} />
    </div>
  );
}

function Pesos(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-suave">$</span>
      <input type="number" inputMode="decimal" min={0} step="0.5" required {...props} className={`${estiloCampo} pl-8`} />
    </div>
  );
}
