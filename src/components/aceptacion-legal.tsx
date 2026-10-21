import Link from "next/link";

// Leyenda de aceptación para registros y pedidos.
export function AceptacionLegal({ accion, className = "" }: { accion: string; className?: string }) {
  return (
    <p className={`text-xs text-suave ${className}`}>
      Al {accion} aceptas los{" "}
      <Link href="/terminos" className="underline underline-offset-2">
        términos y condiciones
      </Link>{" "}
      y el{" "}
      <Link href="/privacidad" className="underline underline-offset-2">
        aviso de privacidad
      </Link>
      .
    </p>
  );
}
