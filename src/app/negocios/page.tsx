import type { Metadata } from "next";
import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Negocios" };

export default function Pagina() {
  return <Proximamente titulo="Negocios" />;
}
