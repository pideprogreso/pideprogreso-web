import type { Metadata } from "next";
import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Mi pedido" };

export default function Pagina() {
  return <Proximamente titulo="Mi pedido" />;
}
