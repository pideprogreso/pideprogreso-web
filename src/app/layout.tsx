import type { Metadata, Viewport } from "next";
import { Figtree, Gabarito } from "next/font/google";
import { Suspense } from "react";
import { BarraCarrito } from "@/components/carrito/barra-carrito";
import { ProveedorCarrito } from "@/components/carrito/proveedor";
import { Encabezado } from "@/components/encabezado";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import { PieDePagina } from "@/components/pie-de-pagina";
import "./globals.css";

const texto = Figtree({
  variable: "--font-texto",
  subsets: ["latin"],
});

const titulos = Gabarito({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "PideProgreso · Pide a los negocios de Nuevo Progreso",
    template: "%s · PideProgreso",
  },
  description:
    "Comida, pan, súper y flores de los negocios de Nuevo Progreso, Tamps., directo a tu puerta o para recoger.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${texto.variable} ${titulos.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-[15px] leading-normal">
        <ProveedorCarrito>
          <Encabezado />
          <main className="pb-12 md:pb-16">{children}</main>
          <PieDePagina />
          <Suspense>
            <BarraCarrito />
          </Suspense>
          <NavegacionInferior />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
