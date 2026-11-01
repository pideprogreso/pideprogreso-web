import type { Metadata } from "next";
import { FormularioRecuperar } from "./formulario";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function PaginaRecuperar() {
  return (
    <div className="mx-auto max-w-md px-4 pt-6 md:pt-14">
      <FormularioRecuperar />
    </div>
  );
}
