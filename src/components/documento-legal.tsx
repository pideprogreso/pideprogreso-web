// Formato común de las páginas legales.
export function DocumentoLegal({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-6 md:px-8 md:pt-12">
      <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] md:text-[36px]">{titulo}</h1>
      <p className="mt-1 text-sm text-suave">Última actualización: {actualizado}</p>
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed [&_h2]:pt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}

export const CORREO_CONTACTO = "pideprogreso@gmail.com";
