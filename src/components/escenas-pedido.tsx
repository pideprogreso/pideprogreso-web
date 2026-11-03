import { House, Store } from "lucide-react";
import type { EstadoPedido, Modalidad } from "@/lib/estados";
import { RepartidorMoto } from "./repartidor-moto";

const VINO = "#6e0f2e";
const VINO_800 = "#580b24";
const VINO_900 = "#3a0617";
const DORADO = "#f2b632";
const DORADO_300 = "#f8cd57";
const DORADO_100 = "#fff2cc";
const NEGRO = "#141212";
const GRIS = "#e6e3df";

// Una escena por estado del pedido, con el mismo estilo que el repartidor en moto.
// Se monta con key={estado}: la animación principal corre una vez al entrar al estado
// y el refresco cada 15 s no la repite.
export function EscenaPedido({ estado, modalidad }: { estado: EstadoPedido; modalidad: Modalidad }) {
  return (
    <div aria-hidden className="escena cambia relative mt-6 h-28 overflow-hidden rounded-2xl bg-superficie">
      {estado === "en_camino" ? (
        <>
          <Store size={22} className="absolute bottom-4 left-4 text-suave" />
          <House size={22} className="absolute bottom-4 right-4 text-suave" />
          <div className="absolute inset-x-4 bottom-[18px] border-t-2 border-dashed border-borde" />
          <div className="absolute inset-x-10 bottom-3">
            <RepartidorMoto />
          </div>
        </>
      ) : estado === "entregado" ? (
        <div className="absolute inset-x-6 bottom-2 flex items-end justify-center gap-4">
          {modalidad === "entrega" && <RepartidorMoto ancho={104} quieta />}
          <Entregado />
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          {estado === "recibido" ? (
            <Ticket />
          ) : estado === "aceptado" ? (
            <Tienda />
          ) : estado === "en_preparacion" ? (
            <Sarten />
          ) : estado === "listo" ? (
            <Bolsa />
          ) : (
            <Ticket apagado />
          )}
        </div>
      )}
    </div>
  );
}

function Sombra({ rx = 34 }: { rx?: number }) {
  return <ellipse cx="70" cy="77" rx={rx} ry="2.5" fill={NEGRO} opacity="0.12" />;
}

function Palomita({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g className="aparece-check">
      <circle cx={cx} cy={cy} r="10" fill={DORADO} />
      <path className="dibuja" pathLength={1} d={`M${cx - 5} ${cy}l3.5 3.5 6.5-7`} stroke={VINO_900} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
}

function LetraP({ x, y, color = "#fff", tamano = 9 }: { x: number; y: number; color?: string; tamano?: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={tamano} fontWeight="800" fill={color} fontFamily="var(--font-titulos), sans-serif">
      p
    </text>
  );
}

// Recibido: la comanda sale de la impresora del negocio y aparece la palomita dorada.
// `apagado` es la versión quieta y gris para pedidos cancelados o rechazados.
export function Ticket({ ancho = 128, apagado = false }: { ancho?: number; apagado?: boolean }) {
  return (
    <svg width={ancho} viewBox="0 0 140 80" className="block">
      <defs>
        <clipPath id="pp-corte-ticket">
          <rect x="0" y="0" width="140" height="56" />
        </clipPath>
      </defs>
      <Sombra />
      <g clipPath="url(#pp-corte-ticket)">
        <g className={apagado ? undefined : "sube-ticket"}>
          <rect x="52" y="8" width="36" height="52" rx="3" fill={apagado ? "#f5f4f2" : "#fff"} stroke={GRIS} />
          <circle cx="70" cy="19" r="6" fill={apagado ? "#a8a29e" : VINO} />
          <LetraP x={70} y={22.3} />
          <rect x="58" y="30" width="24" height="2.5" rx="1.25" fill={GRIS} />
          <rect x="58" y="36" width="17" height="2.5" rx="1.25" fill={GRIS} />
          <rect x="58" y="42" width="21" height="2.5" rx="1.25" fill={GRIS} />
        </g>
      </g>
      <rect x="42" y="52" width="56" height="20" rx="7" fill={apagado ? "#a8a29e" : VINO} />
      <rect x="48" y="55" width="44" height="3" rx="1.5" fill={apagado ? "#78716c" : VINO_900} />
      <circle cx="90" cy="65" r="2" fill={apagado ? "#d6d3d1" : DORADO_300} />
      {!apagado && <Palomita cx={98} cy={20} />}
    </svg>
  );
}

// Aceptado: la tienda confirma con una palomita que se dibuja.
function Tienda() {
  return (
    <svg width={128} viewBox="0 0 140 80" className="block">
      <Sombra rx={36} />
      <g className="asienta">
        <rect x="44" y="30" width="52" height="42" fill={DORADO_100} />
        <rect x="48" y="38" width="11" height="10" rx="2" fill="#ecebe8" />
        <rect x="81" y="38" width="11" height="10" rx="2" fill="#ecebe8" />
        <rect x="62" y="46" width="16" height="26" rx="2" fill={VINO_800} />
        <circle cx="74.5" cy="60" r="1.3" fill={DORADO_300} />
        <rect x="38" y="13" width="64" height="5" rx="2.5" fill={VINO_900} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${40 + 12 * i} 18h12v9a6 6 0 0 1-12 0Z`} fill={i % 2 ? "#fff" : VINO} />
        ))}
      </g>
      <Palomita cx={102} cy={14} />
    </svg>
  );
}

// En preparación: el sartén en la lumbre, con vapor que sube despacio. Es el estado más largo: loop calmado.
export function Sarten({ ancho = 128 }: { ancho?: number }) {
  return (
    <svg width={ancho} viewBox="0 0 140 80" className="block overflow-visible">
      <Sombra rx={40} />
      {[60, 70, 80].map((x, i) => (
        <path
          key={x}
          className="vapor"
          style={{ animationDelay: `${i * 0.8}s` }}
          d={`M${x} 40c-3-4 3-6 0-10s3-6 0-10`}
          stroke="#c9c3bd"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <rect x="30" y="68" width="80" height="6" rx="3" fill={VINO_900} />
      {[60, 70, 80].map((x, i) => (
        <path
          key={x}
          className="flama"
          style={{ animationDelay: `${i * 0.35}s` }}
          d={`M${x} 67c-3.5-3-3.5-7 0-11 3.5 4 3.5 8 0 11Z`}
          fill={i === 1 ? DORADO : DORADO_300}
        />
      ))}
      <g className="asienta">
        <rect x="96" y="48.5" width="28" height="4" rx="2" fill={VINO_800} />
        <path d="M44 50h52c0 7-6 12-13 12H57c-7 0-13-5-13-12Z" fill={NEGRO} />
        <rect x="42" y="47.5" width="56" height="4" rx="2" fill="#2a2626" />
        <ellipse cx="70" cy="47" rx="17" ry="3.5" fill={DORADO_300} />
        <circle cx="63" cy="46.5" r="1.6" fill={VINO} />
        <circle cx="75" cy="46" r="1.6" fill="#0f7a4a" />
        <circle cx="70" cy="47.5" r="1.3" fill={VINO} />
      </g>
    </svg>
  );
}

function BolsaDibujo({ x = 0, escala = 1, conSello = true }: { x?: number; escala?: number; conSello?: boolean }) {
  return (
    <g transform={`translate(${x} 0) scale(${escala})`} style={{ transformOrigin: "70px 72px" }}>
      <path d="M50 30h40l4 42H46Z" fill="#f4d58a" stroke="#e2b95c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 30h40l1 8H49Z" fill="#e9c46a" />
      <path d="M47 64h46" stroke={VINO} strokeWidth="3" />
      <g className={conSello ? "cierra" : undefined}>
        <rect x="49" y="22" width="42" height="10" rx="2" fill={DORADO_300} />
      </g>
      {conSello && (
        <g className="sello">
          <circle cx="70" cy="32" r="8" fill={DORADO} stroke={VINO} strokeWidth="1.5" />
          <LetraP x={70} y={35.3} color={VINO} />
        </g>
      )}
    </g>
  );
}

// Listo: la bolsa se cierra y baja el sello dorado con un pequeño rebote.
export function Bolsa() {
  return (
    <svg width={128} viewBox="0 0 140 80" className="block overflow-visible">
      <Sombra rx={30} />
      <g className="asienta">
        <BolsaDibujo />
      </g>
    </svg>
  );
}

// Entregado: la bolsa en la puerta de la casa y confeti dorado una sola vez.
function Entregado() {
  const confeti = [
    [-26, -30, 160, DORADO],
    [-14, -40, -120, VINO],
    [0, -44, 200, DORADO_300],
    [14, -38, -200, DORADO],
    [26, -28, 140, VINO],
    [-34, -16, -90, DORADO_300],
    [34, -18, 110, DORADO_300],
    [-6, -34, 260, VINO],
    [8, -26, -160, DORADO],
  ] as const;
  return (
    <svg width={128} viewBox="0 0 140 80" className="block overflow-visible">
      <Sombra rx={40} />
      <path d="M78 34l26-20 26 20Z" fill={VINO} />
      <rect x="84" y="34" width="40" height="38" fill="#fff" />
      <rect x="98" y="46" width="13" height="26" rx="2" fill={VINO_800} />
      <circle cx="108" cy="60" r="1.3" fill={DORADO_300} />
      <rect x="88" y="40" width="8" height="8" rx="1.5" fill="#ecebe8" />
      <BolsaDibujo x={-4} escala={0.5} conSello={false} />
      <circle cx="68" cy="47" r="4" fill={DORADO} />
      {confeti.map(([dx, dy, giro, color], i) => (
        <rect
          key={i}
          className="confeti"
          x="66"
          y="40"
          width={i % 2 ? 3 : 4}
          height={i % 2 ? 5 : 3}
          rx="1"
          fill={color}
          style={{ "--x": `${dx}px`, "--y": `${dy}px`, "--giro": `${giro}deg` } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}
