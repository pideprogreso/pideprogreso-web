import type { Metadata } from "next";
import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Registrar mi negocio" };

export default function Pagina() {
  return <Proximamente titulo="Registrar mi negocio" />;
}
