import type { Metadata } from "next";
import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Mis pedidos" };

export default function Pagina() {
  return <Proximamente titulo="Mis pedidos" mensaje="Aquí verás tus pedidos y en qué estado van." />;
}
