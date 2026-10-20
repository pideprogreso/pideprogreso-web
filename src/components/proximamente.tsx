import Link from "next/link";

export function Proximamente({ titulo }: { titulo: string }) {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-2xl font-bold">{titulo}</h1>
      <p className="mt-2 text-suave">Estamos trabajando en esta sección.</p>
      <Link href="/" className="mt-6 inline-block font-medium text-vino-600 underline dark:text-dorado-300">
        Volver al inicio
      </Link>
    </div>
  );
}
