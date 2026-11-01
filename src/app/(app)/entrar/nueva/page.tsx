import type { Metadata } from "next";
import { FormularioNueva } from "./formulario";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function PaginaNueva() {
  return (
    <div className="mx-auto max-w-md px-4 pt-6 md:pt-14">
      <FormularioNueva />
    </div>
  );
}
