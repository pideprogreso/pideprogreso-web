"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Aviso, Campo, estiloCampo } from "@/components/campos";
import { enviarRecuperacion } from "../acciones";

export function FormularioRecuperar() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [enviando, iniciar] = useTransition();

  if (enviado) {
    return (
      <div className="rounded-3xl bg-superficie px-6 py-12 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-white">
          <MailCheck aria-hidden size={28} className="text-vino-700" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">Revisa tu correo</h1>
        <p className="mx-auto mt-2 max-w-xs text-suave">
          Si <strong className="text-foreground">{email}</strong> tiene cuenta, te llegará un enlace para poner una
          contraseña nueva. Ábrelo en este mismo celular.
        </p>
        <p className="mt-4 text-sm text-suave">Si no llega en unos minutos, revisa la carpeta de spam.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        iniciar(async () => {
          const r = await enviarRecuperacion(email);
          if (!r.ok) return setError(r.error);
          setEnviado(true);
        });
      }}
      className="space-y-5"
    >
      <header className="flex items-start gap-3">
        <Link href="/entrar" aria-label="Volver" className="grid size-10 shrink-0 place-items-center rounded-full bg-superficie">
          <ArrowLeft aria-hidden size={20} />
        </Link>
        <div>
          <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
            Recupera tu contraseña
          </h1>
          <p className="mt-1 text-suave">Te mandamos un enlace para poner una nueva.</p>
        </div>
      </header>
      <Campo etiqueta="Correo de tu cuenta" id="email">
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={estiloCampo}
        />
      </Campo>
      {error && <Aviso>{error}</Aviso>}
      <button
        type="submit"
        disabled={enviando}
        className="flex h-14 w-full items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
