import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { BarraCarrito } from "@/components/carrito/barra-carrito";
import { ProveedorCarrito } from "@/components/carrito/proveedor";
import { NavegacionInferior } from "@/components/navegacion-inferior";
import "./globals.css";

const texto = Figtree({
  variable: "--font-texto",
  subsets: ["latin"],
});

const titulos = Bricolage_Grotesque({
  variable: "--font-titulos",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "PideProgreso",
    template: "%s · PideProgreso",
  },
  description:
    "Pide a los negocios de Nuevo Progreso desde tu celular. Hecho para la gente de Nuevo Progreso, Tamps.",
};

export const viewport: Viewport = {
  themeColor: "#6e0f2e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${texto.variable} ${titulos.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <ProveedorCarrito>
          <div className="mx-auto min-h-dvh w-full max-w-xl pb-36 md:max-w-5xl">
            {children}
          </div>
          <Suspense>
            <BarraCarrito />
          </Suspense>
          <NavegacionInferior />
        </ProveedorCarrito>
      </body>
    </html>
  );
}
