import Link from "next/link";

// Logotipo: una "p" en vino con el punto dorado de "aquí es".
export function Marca({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="PideProgreso, inicio" className={`flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="relative grid size-9 place-items-center rounded-[11px] bg-vino-700 font-display text-[22px] font-extrabold leading-none text-white"
      >
        <span className="-mt-1">p</span>
        <span className="absolute right-[7px] top-[7px] size-[7px] rounded-full bg-dorado-400" />
      </span>
      <span className="font-display text-[21px] font-extrabold tracking-[-0.03em]">
        pide<span className="text-vino-700">progreso</span>
      </span>
    </Link>
  );
}
