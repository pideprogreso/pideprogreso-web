import Link from "next/link";

export function Encabezado() {
  return (
    <header className="sticky top-0 z-10 bg-vino-700 text-white shadow-sm">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Pide<span className="text-dorado-300">Progreso</span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 text-sm">
          <Link
            href="/negocios"
            className="rounded-full px-3 py-1.5 hover:bg-vino-600"
          >
            Negocios
          </Link>
          <Link
            href="/carrito"
            className="rounded-full bg-dorado-400 px-3 py-1.5 font-medium text-vino-900 hover:bg-dorado-300"
          >
            Mi pedido
          </Link>
        </nav>
      </div>
    </header>
  );
}
