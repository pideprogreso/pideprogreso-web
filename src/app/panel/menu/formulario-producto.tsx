"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso, Campo, estiloCampo, Interruptor } from "@/components/campos";
import { SubirFoto } from "@/components/subir-foto";
import { borrarProducto, guardarProducto, type DatosProducto } from "../acciones";

export function FormularioProducto({
  negocioId,
  inicial,
  secciones,
}: {
  negocioId: string;
  inicial: DatosProducto;
  secciones: string[];
}) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [precio, setPrecio] = useState(inicial.precio ? String(inicial.precio) : "");
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const poner = <K extends keyof DatosProducto>(k: K, v: DatosProducto[K]) => setD((x) => ({ ...x, [k]: v }));

  function volver() {
    router.replace("/panel/menu");
    router.refresh();
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await guardarProducto({ ...d, precio: Number(precio) });
      if (!r.ok) return setError(r.error);
      volver();
    });
  }

  function borrar() {
    if (!d.id || !window.confirm(`¿Borrar "${d.nombre}" del menú?`)) return;
    iniciar(async () => {
      const r = await borrarProducto(d.id!);
      if (!r.ok) return setError(r.error);
      volver();
    });
  }

  return (
    <form onSubmit={enviar} className="mx-auto max-w-xl space-y-5 pt-6 md:pt-8">
      <header className="flex items-center gap-3">
        <Link href="/panel/menu" aria-label="Volver al menú" className="grid size-10 place-items-center rounded-full bg-superficie">
          <ArrowLeft aria-hidden size={20} />
        </Link>
        <h2 className="font-display text-2xl font-bold">{d.id ? "Editar producto" : "Nuevo producto"}</h2>
      </header>

      <SubirFoto negocioId={negocioId} valor={d.imagenUrl} onCambio={(v) => poner("imagenUrl", v)} etiqueta="Foto" />

      <Campo etiqueta="Nombre" id="nombre">
        <input
          id="nombre"
          required
          maxLength={120}
          value={d.nombre}
          onChange={(e) => poner("nombre", e.target.value)}
          className={estiloCampo}
        />
      </Campo>
      <Campo etiqueta="Descripción (opcional)" id="descripcion" ayuda="Ingredientes, tamaño o lo que incluye.">
        <textarea
          id="descripcion"
          rows={2}
          maxLength={500}
          value={d.descripcion}
          onChange={(e) => poner("descripcion", e.target.value)}
          className={`${estiloCampo} h-auto py-3`}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo etiqueta="Precio" id="precio">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-suave">$</span>
            <input
              id="precio"
              type="number"
              inputMode="decimal"
              min={0.5}
              step="0.5"
              required
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className={`${estiloCampo} pl-8`}
            />
          </div>
        </Campo>
        <Campo etiqueta="Sección" id="seccion" ayuda="Ej.: Tacos, Bebidas.">
          <input
            id="seccion"
            list="secciones"
            maxLength={60}
            value={d.seccion}
            onChange={(e) => poner("seccion", e.target.value)}
            className={estiloCampo}
          />
          <datalist id="secciones">
            {secciones.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Campo>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-borde px-4 py-3.5">
        <div className="flex-1">
          <p className="font-semibold">Disponible</p>
          <p className="text-sm text-suave">Apágalo cuando se termine.</p>
        </div>
        <Interruptor activo={d.disponible} onCambio={(v) => poner("disponible", v)} etiqueta="Disponible" />
      </div>

      {error && <Aviso>{error}</Aviso>}

      <div className="flex gap-3 pt-2">
        {d.id && (
          <button
            type="button"
            onClick={borrar}
            disabled={enviando}
            aria-label="Borrar producto"
            className="grid size-14 shrink-0 place-items-center rounded-full border border-borde text-vino-700 hover:bg-vino-50 disabled:opacity-50"
          >
            <Trash2 aria-hidden size={20} />
          </button>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="flex h-14 flex-1 items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
        >
          {enviando ? "Guardando…" : d.id ? "Guardar cambios" : "Agregar al menú"}
        </button>
      </div>
    </form>
  );
}
