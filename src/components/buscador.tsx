"use client";

import { Search, X } from "lucide-react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";

// Buscador del encabezado. En /negocios conserva lo que se buscó.
export function Buscador() {
  return (
    <Suspense fallback={<Campo valor="" />}>
      <CampoConUrl />
    </Suspense>
  );
}

function CampoConUrl() {
  const params = useSearchParams();
  return (
    <Campo
      key={params.toString()}
      valor={params.get("q") ?? ""}
      categoria={params.get("categoria") ?? undefined}
    />
  );
}

function Campo({ valor, categoria }: { valor: string; categoria?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Form action="/negocios" role="search" className="group relative w-full">
      <label htmlFor="q" className="sr-only">
        Buscar negocios o productos
      </label>
      <Search
        aria-hidden
        size={19}
        strokeWidth={2.2}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground"
      />
      <input
        ref={ref}
        id="q"
        name="q"
        type="search"
        defaultValue={valor}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Tacos, pizza, pan dulce…"
        className="h-12 w-full rounded-full bg-superficie pl-11 pr-11 text-[15px] font-medium placeholder:font-normal placeholder:text-suave focus:bg-white focus:outline-none focus:ring-2 focus:ring-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={() => {
            if (ref.current) {
              ref.current.value = "";
              ref.current.focus();
            }
          }}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-suave hover:bg-superficie-2"
        >
          <X aria-hidden size={16} />
        </button>
      )}
      {categoria && <input type="hidden" name="categoria" value={categoria} />}
    </Form>
  );
}
