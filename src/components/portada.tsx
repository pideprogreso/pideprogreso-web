import Image from "next/image";
import { buscarCategoria } from "@/lib/categorias";

// Foto del negocio o producto. Mientras no haya foto, muestra una ilustración
// con el color y el ícono de su categoría.
export function Portada({
  src,
  alt,
  categoria,
  sizes,
  tamanoIcono = "text-6xl",
  prioridad = false,
}: {
  src: string | null;
  alt: string;
  categoria: string | null;
  sizes: string;
  tamanoIcono?: string;
  prioridad?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={prioridad}
        className="object-cover"
      />
    );
  }

  const cat = buscarCategoria(categoria);
  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 grid place-items-center overflow-hidden"
      style={{ backgroundColor: cat?.fondo ?? "#F3E6E9" }}
    >
      <span aria-hidden className={`${tamanoIcono} drop-shadow-[0_8px_10px_rgba(61,7,25,0.25)]`}>
        {cat?.icono ?? "🛍️"}
      </span>
    </div>
  );
}
