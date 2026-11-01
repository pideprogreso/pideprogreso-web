"use client";

import { CircleCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { Aviso, Campo, estiloCampo } from "@/components/campos";
import { CATEGORIAS } from "@/lib/categorias";
import { registrarInteresado } from "./acciones";

const VACIO = { nombre: "", negocio: "", telefono: "", correo: "", giro: "" };

export function FormularioInteresado() {
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, iniciar] = useTransition();

  const cambiar = (campo: keyof typeof VACIO) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDatos((d) => ({ ...d, [campo]: e.target.value }));

  if (enviado) {
    return (
      <div role="status" className="py-8 text-center">
        <CircleCheck aria-hidden size={48} className="mx-auto text-vino-700" />
        <h2 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.02em]">¡Listo, {datos.nombre.split(" ")[0]}!</h2>
        <p className="mx-auto mt-2 max-w-xs text-suave">
          Te escribimos por WhatsApp con el costo de la suscripción y cómo trabajamos.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        iniciar(async () => {
          const r = await registrarInteresado(datos);
          if (r.ok) setEnviado(true);
          else setError(r.error);
        });
      }}
    >
      <Campo etiqueta="Tu nombre" id="nombre">
        <input id="nombre" required autoComplete="name" value={datos.nombre} onChange={cambiar("nombre")} className={estiloCampo} />
      </Campo>
      <Campo etiqueta="Nombre del negocio" id="negocio">
        <input id="negocio" required autoComplete="organization" value={datos.negocio} onChange={cambiar("negocio")} className={estiloCampo} />
      </Campo>
      <Campo etiqueta="Giro" id="giro">
        <select id="giro" required value={datos.giro} onChange={cambiar("giro")} className={estiloCampo}>
          <option value="" disabled>
            Elige uno
          </option>
          {CATEGORIAS.map((c) => (
            <option key={c.slug}>{c.nombre}</option>
          ))}
          <option>Otro</option>
        </select>
      </Campo>
      <Campo etiqueta="Teléfono o WhatsApp" id="telefono" ayuda="A este número te mandamos la información.">
        <input
          id="telefono"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="899 123 4567"
          value={datos.telefono}
          onChange={cambiar("telefono")}
          className={estiloCampo}
        />
      </Campo>
      <Campo etiqueta="Correo (opcional)" id="correo">
        <input id="correo" type="email" autoComplete="email" value={datos.correo} onChange={cambiar("correo")} className={estiloCampo} />
      </Campo>
      {error && <Aviso>{error}</Aviso>}
      <button
        type="submit"
        disabled={enviando}
        className="flex h-14 w-full items-center justify-center rounded-full bg-vino-700 font-semibold text-white hover:bg-vino-800 disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Quiero más información"}
      </button>
      <p className="text-center text-xs text-suave">Sin compromiso. Solo usamos tus datos para contactarte.</p>
    </form>
  );
}
