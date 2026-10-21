import { Suspense } from "react";
import { PestanasAdmin } from "./pestanas";

export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8">
      <p className="pt-6 text-sm font-bold uppercase tracking-wider text-vino-700 md:pt-10">Administración</p>
      <Suspense fallback={<div className="mt-4 h-11" />}>
        <PestanasAdmin />
      </Suspense>
      {children}
    </div>
  );
}
