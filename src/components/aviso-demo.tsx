import { modoDemo } from "@/lib/datos";

export function AvisoDemo() {
  if (!modoDemo) return null;
  return (
    <p className="mx-4 mt-4 rounded-xl bg-dorado-100 px-3 py-2 text-sm text-dorado-700 md:mx-0">
      Estás viendo negocios de ejemplo. Conecta Supabase para mostrar los reales.
    </p>
  );
}
