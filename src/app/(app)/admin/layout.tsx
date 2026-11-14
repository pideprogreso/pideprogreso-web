import { Suspense } from "react";
import { PestanasAdmin } from "./pestanas";

export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-7xl px-4 md:grid md:grid-cols-[13.5rem_minmax(0,1fr)] md:items-start md:gap-8 md:px-8 md:pt-8">
      <p className="pt-6 text-sm font-bold uppercase tracking-wider text-vino-700 md:hidden">Administración</p>
      <div className="mt-3 md:mt-0">
        <Suspense fallback={<div className="h-11 md:h-64" />}>
          <PestanasAdmin />
        </Suspense>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
