import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { obtenerProductoPanel, obtenerProductosPanel, requerirNegocio } from "@/lib/panel";
import { FormularioProducto } from "../formulario-producto";

export const metadata: Metadata = { title: "Editar producto" };

export default function PaginaEditar({ params }: PageProps<"/panel/menu/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-96 max-w-xl animate-pulse rounded-2xl bg-superficie" />}>
      <Editar params={params} />
    </Suspense>
  );
}

async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const negocio = await requerirNegocio("/panel/menu");
  const [producto, productos] = await Promise.all([
    obtenerProductoPanel(negocio.id, id),
    obtenerProductosPanel(negocio.id),
  ]);
  if (!producto) notFound();
  return (
    <FormularioProducto
      negocioId={negocio.id}
      secciones={[...new Set(productos.map((p) => p.seccion))]}
      inicial={{
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? "",
        precio: producto.precio,
        seccion: producto.seccion,
        imagenUrl: producto.imagenUrl,
        disponible: producto.disponible,
      }}
    />
  );
}
