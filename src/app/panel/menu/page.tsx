import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { obtenerProductosPanel, requerirNegocio } from "@/lib/panel";
import { ListaMenu } from "./lista-menu";

export const metadata: Metadata = { title: "Menú" };

export default function PaginaMenu() {
  return (
    <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-2xl bg-superficie" />}>
      <Menu />
    </Suspense>
  );
}

async function Menu() {
  const negocio = await requerirNegocio("/panel/menu");
  const productos = await obtenerProductosPanel(negocio.id);
  const agotados = productos.filter((p) => !p.disponible).length;
  const sinFoto = productos.filter((p) => !p.imagenUrl).length;

  return (
    <div className="pt-5 md:pt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Menú</h2>
          <p className="text-sm text-suave">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
            {agotados > 0 && ` · ${agotados} agotados`}
            {sinFoto > 0 && ` · ${sinFoto} sin foto`}
          </p>
        </div>
        {/* En celular el botón flota sobre la barra inferior, al alcance del pulgar. */}
        <Link
          href="/panel/menu/nuevo"
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-20 inline-flex h-14 items-center gap-2 rounded-full bg-vino-700 px-5 font-semibold text-white shadow-lg shadow-vino-900/30 hover:bg-vino-800 md:static md:h-12 md:shadow-none"
        >
          <Plus aria-hidden size={20} />
          Producto
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-superficie px-6 py-12 text-center">
          <p className="font-display text-xl font-bold">Tu menú está vacío</p>
          <p className="mx-auto mt-1 max-w-xs text-suave">
            Agrega tus productos con precio y foto. Los clientes piden más cuando ven la foto.
          </p>
        </div>
      ) : (
        <ListaMenu productos={productos} />
      )}
      <div className="h-20 md:hidden" />
    </div>
  );
}
