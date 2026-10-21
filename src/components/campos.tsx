// Piezas de formulario compartidas.

export const estiloCampo =
  "h-12 w-full rounded-xl border border-borde bg-white px-4 text-[15px] placeholder:text-suave/70 focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground";

export function Campo({
  etiqueta,
  id,
  ayuda,
  children,
}: {
  etiqueta: string;
  id: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {etiqueta}
      </label>
      {children}
      {ayuda && <p className="mt-1 text-xs text-suave">{ayuda}</p>}
    </div>
  );
}

export function Interruptor({
  activo,
  onCambio,
  etiqueta,
  deshabilitado = false,
}: {
  activo: boolean;
  onCambio: (valor: boolean) => void;
  etiqueta: string;
  deshabilitado?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={() => onCambio(!activo)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vino-700 disabled:opacity-50 ${
        activo ? "bg-abierto" : "bg-superficie-2"
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform duration-200 ease-salida ${
          activo ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-vino-50 px-3 py-2 text-sm font-medium text-vino-700">
      {children}
    </p>
  );
}
