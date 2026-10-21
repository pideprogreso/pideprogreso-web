import Link from "next/link";

export function Proximamente({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  return (
    <div className="px-6 pt-20 pb-10 text-center">
      <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em]">{titulo}</h1>
      <p className="mx-auto mt-2 max-w-xs text-suave">{mensaje}</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-vino-700 px-6 font-semibold text-white hover:bg-vino-800"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
