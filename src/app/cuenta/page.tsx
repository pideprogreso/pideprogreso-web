import type { Metadata } from "next";
import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Mi cuenta" };

export default function Pagina() {
  return <Proximamente titulo="Mi cuenta" mensaje="Pronto podrás crear tu cuenta con tu número de celular." />;
}
