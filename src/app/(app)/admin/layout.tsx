import { Suspense } from "react";
import { esAdmin, obtenerInteresados, obtenerReportes } from "@/lib/admin";
import { PestanasAdmin } from "./pestanas";

const hora = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Matamoros" });

export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-7xl px-4 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:items-start md:gap-8 md:px-8 md:pt-8">
      <p className="pt-6 text-sm font-bold uppercase tracking-wider text-vino-700 md:hidden">Administración</p>
      <div className="mt-3 md:mt-0">
        <Suspense fallback={<PestanasAdmin />}>
          <Navegacion />
        </Suspense>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// Los contadores solo se piden si quien entra es admin; la página misma ya responde 404 a los demás.
async function Navegacion() {
  if (!(await esAdmin())) return <PestanasAdmin />;
  const [reportes, interesados] = await Promise.all([obtenerReportes(), obtenerInteresados()]);
  return (
    <PestanasAdmin
      avisos={{
        "/admin/reportes": reportes.filter((r) => !r.resuelto).length,
        "/admin/interesados": interesados.filter((i) => !i.contactado).length,
      }}
      actualizado={hora.format(new Date())}
    />
  );
}
