import { Suspense, ViewTransition } from "react";

// Suspense con relevo: al navegar, el esqueleto sale rápido y el contenido entra con fundido y 8px.
// En la primera carga (HTML del servidor) no anima nada.
export function SuspenseRevela({ fallback, children }: { fallback: React.ReactNode; children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <ViewTransition exit="sale-carga" default="none">
          {fallback}
        </ViewTransition>
      }
    >
      <ViewTransition enter="entra-contenido" default="none">
        {children}
      </ViewTransition>
    </Suspense>
  );
}
