import type { MetadataRoute } from "next";

// Hace la app instalable ("Agregar a inicio"). En iPhone es requisito para recibir avisos.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PideProgreso",
    short_name: "PideProgreso",
    description: "Pide a los negocios de Nuevo Progreso, Tamps.",
    lang: "es-MX",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6e0f2e",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-mascara-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Mis pedidos", url: "/pedidos" },
      { name: "Pedidos de mi negocio", url: "/panel" },
    ],
  };
}
