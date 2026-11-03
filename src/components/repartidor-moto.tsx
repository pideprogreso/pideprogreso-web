// Repartidor en moto con la caja de PideProgreso. Sale con un jalón y cruza su contenedor.
// `ciclo` la sincroniza con el estado "¡Va en camino!" del celular de muestra en Próximamente; `quieta` la deja estacionada.
export function RepartidorMoto({ ancho = 128, ciclo = false, quieta = false }: { ancho?: number; ciclo?: boolean; quieta?: boolean }) {
  return (
    <div aria-hidden className={quieta ? "moto-quieta" : `w-full ${ciclo ? "moto-ciclo" : "moto-viaje"}`} style={{ "--moto": `${ancho}px` } as React.CSSProperties}>
      <svg width={ancho} viewBox="0 0 140 80" className="block overflow-visible">
        <g className="moto-viento" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round">
          <line x1="2" y1="30" x2="14" y2="30" />
          <line x1="6" y1="42" x2="18" y2="42" />
          <line x1="0" y1="54" x2="10" y2="54" />
        </g>
        <circle className="moto-humo" cx="22" cy="62" r="4" fill="#d9d5d0" />
        <circle className="moto-humo [animation-delay:120ms]" cx="18" cy="58" r="3" fill="#d9d5d0" />
        <ellipse cx="78" cy="77" rx="46" ry="2.5" fill="#141212" opacity="0.12" />

        <g className="moto-jalon">
          <Rueda cx={46} />
          <Rueda cx={112} />
          <g className="moto-cuerpo">
            <rect x="26" y="59" width="16" height="3.5" rx="1.75" fill="#66605c" />
            {/* Caja de entrega */}
            <rect x="22" y="14" width="30" height="26" rx="5" fill="#f2b632" />
            <rect x="22" y="14" width="30" height="7" rx="3.5" fill="#f8cd57" />
            <rect x="30" y="24" width="14" height="12" rx="3.5" fill="#fff" />
            <text x="37" y="33.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#6e0f2e" fontFamily="var(--font-titulos), sans-serif">
              p
            </text>
            {/* Carrocería */}
            <path d="M30 58C30 46 37 41 49 41h22c4 0 7 3 7 7v6l-24 5Z" fill="#6e0f2e" />
            <rect x="54" y="53" width="42" height="7" rx="3.5" fill="#580b24" />
            <path d="M90 59c1-12 6-22 13-30l7 2c-5 8-7 17-7 28Z" fill="#6e0f2e" />
            <path d="M107 30l5 32" stroke="#141212" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="46" y="37" width="26" height="5" rx="2.5" fill="#141212" />
            <circle cx="112" cy="33" r="3.5" fill="#f8cd57" />
            {/* Repartidor */}
            <path d="M62 40l16 4 6 11" stroke="#3a0617" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M56 40l6-21c1-4 4-5 8-4l5 1c3 1 4 4 3 7l-6 18Z" fill="#3a0617" />
            <path d="M61 26l13 3" stroke="#f2b632" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M71 21l12 6 17-4" stroke="#3a0617" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M97 22h9" stroke="#141212" strokeWidth="4" strokeLinecap="round" />
            <circle cx="101" cy="23" r="2.8" fill="#141212" />
            <circle cx="72" cy="10" r="9" fill="#f2b632" />
            <path d="M68 2.5c3-1 7-1 9.5 1" stroke="#6e0f2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M74 8h7c1 4-1 7-5 7h-2Z" fill="#141212" opacity="0.85" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Rueda({ cx }: { cx: number }) {
  return (
    <g className="moto-rueda">
      <circle cx={cx} cy="64" r="12" fill="#141212" />
      <circle cx={cx} cy="64" r="7.5" fill="#ecebe8" />
      <path d={`M${cx - 7.5} 64h15M${cx} 56.5v15`} stroke="#66605c" strokeWidth="1.6" />
      <circle cx={cx} cy="64" r="2.5" fill="#141212" />
    </g>
  );
}
