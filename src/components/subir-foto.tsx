"use client";

import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

// Reduce la foto en el celular antes de subirla: carga rápido y no gasta datos.
async function reducir(archivo: File, ladoMax: number): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, ladoMax / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")!.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  return new Promise((ok, falla) =>
    lienzo.toBlob((b) => (b ? ok(b) : falla(new Error("No se pudo leer la foto"))), "image/jpeg", 0.82),
  );
}

export function SubirFoto({
  negocioId,
  valor,
  onCambio,
  etiqueta,
  forma = "ancha",
}: {
  negocioId: string;
  valor: string | null;
  onCambio: (url: string | null) => void;
  etiqueta: string;
  forma?: "ancha" | "cuadrada";
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setError(null);
    setSubiendo(true);
    try {
      const blob = await reducir(archivo, forma === "cuadrada" ? 800 : 1600);
      const ruta = `${negocioId}/${crypto.randomUUID()}.jpg`;
      const almacen = crearClienteNavegador().storage.from("fotos");
      const { error: e } = await almacen.upload(ruta, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (e) throw e;
      onCambio(almacen.getPublicUrl(ruta).data.publicUrl);
    } catch (err) {
      console.error(err);
      setError("No se pudo subir la foto. Intenta con otra o revisa tu conexión.");
    } finally {
      setSubiendo(false);
    }
  }

  const caja = forma === "cuadrada" ? "aspect-square w-28" : "aspect-[16/10] w-full";

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{etiqueta}</p>
      <div>
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={subiendo}
          className={`relative grid ${caja} place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-borde bg-superficie text-suave hover:border-suave`}
        >
          {valor && <Image src={valor} alt="" fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />}
          <span
            className={`relative inline-flex ${forma === "cuadrada" && !valor ? "flex-col" : ""} items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
              valor ? "bg-black/60 text-white" : ""
            }`}
          >
            {subiendo ? (
              <LoaderCircle aria-hidden size={18} className="animate-spin" />
            ) : (
              <Camera aria-hidden size={18} />
            )}
            {subiendo ? "Subiendo…" : valor ? "Cambiar" : "Subir foto"}
          </span>
        </button>
        {valor && !subiendo && (
          <button
            type="button"
            onClick={() => onCambio(null)}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-suave hover:text-vino-700"
          >
            <Trash2 aria-hidden size={16} />
            Quitar foto
          </button>
        )}
      </div>
      <input ref={entrada} type="file" accept="image/*" onChange={elegir} className="sr-only" tabIndex={-1} />
      {error && <p className="mt-1 text-sm text-vino-700">{error}</p>}
    </div>
  );
}
