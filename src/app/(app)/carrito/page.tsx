import type { Metadata } from "next";
import { VistaCarrito } from "./vista-carrito";

export const metadata: Metadata = { title: "Mi pedido" };

export default function PaginaCarrito() {
  return <VistaCarrito />;
}
