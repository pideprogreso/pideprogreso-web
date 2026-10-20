import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Encabezado } from "@/components/encabezado";
import { PieDePagina } from "@/components/pie-de-pagina";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans-app",
  subsets: ["latin"],
});

const display = Playfair_Display({
  variable: "--font-display-app",
  subsets: ["latin"],
  weight: ["600", "700"],
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
  themeColor: "#6b1a33",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Encabezado />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10">
          {children}
        </main>
        <PieDePagina />
      </body>
    </html>
  );
}
