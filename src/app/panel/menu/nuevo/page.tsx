import type { Metadata } from "next";
import { Suspense } from "react";
import { obtenerProductosPanel, requerirNegocio } from "@/lib/panel";
import { FormularioProducto } from "../formulario-producto";

export const metadata: Metadata = { title: "Nuevo producto" };

export default function PaginaNuevo() {
  return (
    <Suspense fallback={<div className="mx-auto mt-6 h-96 max-w-xl animate-pulse rounded-2xl bg-superficie" />}>
      <Nuevo />
    </Suspense>
  );
}

async function Nuevo() {
  const negocio = await requerirNegocio("/panel/menu/nuevo");
  const secciones = [...new Set((await obtenerProductosPanel(negocio.id)).map((p) => p.seccion))];
  return (
    <FormularioProducto
      negocioId={negocio.id}
      secciones={secciones}
      inicial={{
        id: null,
        nombre: "",
        descripcion: "",
        precio: 0,
        seccion: secciones[0] ?? "Menú",
        imagenUrl: null,
        disponible: true,
      }}
    />
  );
}
