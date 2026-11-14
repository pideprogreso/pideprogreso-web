import type { LucideIcon } from "lucide-react";
import { dinero } from "@/lib/formato";

// Piezas compartidas por los tableros de administración y del negocio.
const zona = "America/Matamoros";
const claveDia = new Intl.DateTimeFormat("en-CA", { timeZone: zona });
const diaMes = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: zona });

export type Dia = { clave: string; etiqueta: string; pedidos: number; vendido: number };

export function ultimosDias(pedidos: { creadoEn: string; estado: string; total: number }[], cuantos = 14): Dia[] {
  const dias = Array.from({ length: cuantos }, (_, i) => {
    const d = new Date(Date.now() - (cuantos - 1 - i) * 86_400_000);
    return { clave: claveDia.format(d), etiqueta: diaMes.format(d), pedidos: 0, vendido: 0 };
  });
  for (const p of pedidos) {
    const dia = dias.find((d) => d.clave === claveDia.format(new Date(p.creadoEn)));
    if (!dia) continue;
    dia.pedidos++;
    if (p.estado === "entregado") dia.vendido += p.total;
  }
  return dias;
}

export const COLORES_DONA = ["#3a0617", "#85173c", "#f2b632", "#d98aa3", "#f8cd57", "#ecebe8"];

export function Panel({
  titulo,
  Icono,
  accion,
  children,
}: {
  titulo: string;
  Icono: LucideIcon;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-borde bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <Icono aria-hidden size={20} className="shrink-0 text-vino-700" />
        <h2 className="flex-1 font-display text-lg font-bold">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

export function Grafica({ dias }: { dias: Dia[] }) {
  const [ancho, alto, izq, abajo] = [640, 220, 32, 26];
  const tope = Math.max(4, Math.ceil(Math.max(...dias.map((d) => d.pedidos)) / 4) * 4);
  const x = (i: number) => izq + (i * (ancho - izq - 24)) / (dias.length - 1);
  const y = (v: number) => 8 + (1 - v / tope) * (alto - abajo - 8);
  const linea = dias.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.pedidos)}`).join("");
  const paso = Math.ceil(dias.length / 7); // unas 7 fechas en el eje, contando desde hoy hacia atrás
  const marcas = [0, 1, 2, 3, 4].map((k) => (tope * k) / 4);
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="mt-4 w-full" role="img" aria-label={`Pedidos por día: ${dias.map((d) => `${d.etiqueta} ${d.pedidos}`).join(", ")}`}>
      <defs>
        <linearGradient id="relleno-pedidos" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#85173c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#85173c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {marcas.map((m) => (
        <g key={m}>
          <line x1={izq} x2={ancho - 24} y1={y(m)} y2={y(m)} stroke="#e6e3df" />
          <text x={izq - 8} y={y(m) + 4} textAnchor="end" fontSize="12" fill="#66605c">
            {m}
          </text>
        </g>
      ))}
      <path d={`${linea}L${x(dias.length - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill="url(#relleno-pedidos)" />
      <path d={linea} fill="none" stroke="#6e0f2e" strokeWidth="2.5" strokeLinejoin="round" />
      {dias.map((d, i) => (
        <g key={d.clave}>
          <circle cx={x(i)} cy={y(d.pedidos)} r={i === dias.length - 1 ? 5 : 3.5} fill={i === dias.length - 1 ? "#f2b632" : "#6e0f2e"} stroke="#fff" strokeWidth="1.5">
            <title>{`${d.etiqueta}: ${d.pedidos} pedidos · ${dinero(d.vendido)} entregado`}</title>
          </circle>
          {(dias.length - 1 - i) % paso === 0 && (
            <text x={x(i)} y={alto - 6} textAnchor="middle" fontSize="12" fill="#66605c">
              {d.etiqueta}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function Dona({
  categorias,
  unidad = "pedidos",
  vacio = "Aún no hay pedidos este mes.",
}: {
  categorias: { nombre: string; pedidos: number; color: string }[];
  unidad?: string;
  vacio?: string;
}) {
  const total = categorias.reduce((s, c) => s + c.pedidos, 0);
  if (total === 0) return <p className="text-suave">{vacio}</p>;
  const partes = categorias.map((c, i) => {
    const antes = categorias.slice(0, i).reduce((s, o) => s + o.pedidos, 0);
    return `${c.color} ${(antes / total) * 360}deg ${((antes + c.pedidos) / total) * 360}deg`;
  });
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative size-40 shrink-0 rounded-full" style={{ background: `conic-gradient(${partes.join(",")})` }}>
        <div className="absolute inset-7 grid place-items-center rounded-full bg-white text-center">
          <p>
            <span className="block font-display text-2xl font-extrabold tabular-nums">{total}</span>
            <span className="text-xs text-suave">{unidad}</span>
          </p>
        </div>
      </div>
      <ul className="min-w-36 flex-1 space-y-2 text-sm">
        {categorias.map((c) => (
          <li key={c.nombre} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: c.color }} />
            <span className="flex-1 truncate">{c.nombre}</span>
            <span className="font-semibold tabular-nums">{Math.round((c.pedidos / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Dato({
  titulo,
  valor,
  Icono,
  hoy,
  ayer,
  nota,
  contra = "vs ayer",
}: {
  titulo: string;
  valor: string;
  Icono: LucideIcon;
  hoy?: number;
  ayer?: number;
  nota?: string;
  contra?: string;
}) {
  const cambio = hoy !== undefined && ayer ? Math.round(((hoy - ayer) / ayer) * 100) : null;
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-borde bg-white p-4 sm:flex-row sm:items-start md:p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-vino-900 text-dorado-300 md:size-12">
        <Icono aria-hidden size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-suave">{titulo}</p>
        <p className="font-display text-2xl font-extrabold tabular-nums md:text-3xl">{valor}</p>
        {cambio !== null ? (
          <p className={`text-xs font-semibold ${cambio >= 0 ? "text-abierto" : "text-vino-600"}`}>
            {cambio >= 0 ? "▲" : "▼"} {Math.abs(cambio)}% <span className="font-normal text-suave">{contra}</span>
          </p>
        ) : (
          <p className="text-xs text-suave">{nota ?? (hoy !== undefined ? "Sin datos para comparar" : "")}</p>
        )}
      </div>
    </div>
  );
}

