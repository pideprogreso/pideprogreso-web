import type { Metadata } from "next";
import { FormularioConfirmar } from "./formulario";

export const metadata: Metadata = { title: "Confirmar pedido" };

export default function PaginaConfirmar() {
  return <FormularioConfirmar />;
}
