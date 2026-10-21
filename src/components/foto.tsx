import Image from "next/image";

// Foto de negocio. Sin foto, una portada de marca con las iniciales del negocio
// (nunca un ícono genérico: cada negocio se ve distinto).
export function FotoNegocio({
  src,
  nombre,
  sizes,
  prioridad = false,
  className = "",
}: {
  src: string | null;
  nombre: string;
  sizes: string;
  prioridad?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={prioridad}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`absolute inset-0 grid place-items-center bg-vino-700 bg-[radial-gradient(120%_90%_at_85%_0%,#f2b63255_0%,transparent_55%)] ${className}`}
    >
      <span className="font-display text-[clamp(2rem,8cqw,4rem)] font-extrabold tracking-tight text-white/90">
        {iniciales(nombre)}
      </span>
    </div>
  );
}

export function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
