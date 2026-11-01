import { Suspense } from "react";
import { BarraCarrito } from "@/components/carrito/barra-carrito";
import { ProveedorCarrito } from "@/components/carrito/proveedor";
import { Encabezado } from "@/components/encabezado";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import { PieDePagina } from "@/components/pie-de-pagina";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorCarrito>
      <Encabezado />
      <main className="pb-12 md:pb-16">{children}</main>
      <PieDePagina />
      <Suspense>
        <BarraCarrito />
      </Suspense>
      <NavegacionInferior />
    </ProveedorCarrito>
  );
}
