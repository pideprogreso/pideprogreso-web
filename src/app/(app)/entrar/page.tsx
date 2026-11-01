import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioAcceso } from "./formulario";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <div className="mx-auto max-w-md px-4 pt-6 md:pt-14">
      <Suspense fallback={<div className="h-[480px] animate-pulse rounded-3xl bg-superficie" />}>
        <FormularioAcceso />
      </Suspense>
    </div>
  );
}
