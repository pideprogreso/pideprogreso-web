import { Search } from "lucide-react";
import Form from "next/form";

export function Buscador({
  valor = "",
  categoria,
  autoFocus = false,
}: {
  valor?: string;
  categoria?: string;
  autoFocus?: boolean;
}) {
  return (
    <Form action="/negocios" role="search" className="relative">
      <label htmlFor="q" className="sr-only">
        Buscar negocios o productos
      </label>
      <Search
        aria-hidden
        size={20}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-vino-700"
      />
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={valor}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="¿Qué se te antoja hoy?"
        className="h-13 w-full rounded-full bg-white pl-12 pr-4 text-base text-[#1f1418] shadow-sm ring-1 ring-black/5 placeholder:text-[#8a7a7f] focus:outline-none focus:ring-2 focus:ring-dorado-400"
      />
      {categoria && <input type="hidden" name="categoria" value={categoria} />}
    </Form>
  );
}
