"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso, Campo, estiloCampo } from "@/components/campos";
import { cambiarPassword } from "../acciones";

// Se llega aquí desde el enlace del correo, ya con sesión iniciada.
export function FormularioNueva() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        iniciar(async () => {
          const r = await cambiarPassword(password);
          if (!r.ok) return setError(r.error);
          router.replace("/cuenta");
          router.refresh();
        });
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">Pon tu nueva contraseña</h1>
        <p className="mt-1 text-suave">La usarás la próxima vez que entres.</p>
      </div>
      <Campo etiqueta="Nueva contraseña" id="password" ayuda="Mínimo 8 caracteres.">
        <div className="relative">
          <input
            id="password"
            type={ver ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${estiloCampo} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-suave"
          >
            {ver ? <EyeOff aria-hidden size={20} /> : <Eye aria-hidden size={20} />}
          </button>
        </div>
      </Campo>
      {error && (
        <>
          <Aviso>{error}</Aviso>
          <Link href="/entrar/recuperar" className="inline-block text-sm font-semibold text-vino-700 hover:underline">
            Pedir otro enlace
          </Link>
        </>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="flex h-14 w-full items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
      >
        {enviando ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
