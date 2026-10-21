"use client";

import { Eye, EyeOff, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso, Campo, estiloCampo } from "@/components/campos";
import { AceptacionLegal } from "@/components/aceptacion-legal";
import { BotonGoogle } from "@/components/boton-google";
import { Captcha, captchaActivo } from "@/components/captcha";
import { crearCuenta, entrar } from "./acciones";

type Modo = "entrar" | "crear";

export function FormularioAcceso() {
  const router = useRouter();
  const params = useSearchParams();
  const siguiente = params.get("siguiente") ?? "/cuenta";
  const [modo, setModo] = useState<Modo>(params.get("modo") === "crear" ? "crear" : "entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "enlace"
      ? "No pudimos completar el acceso. Intenta de nuevo."
      : params.get("error") === "google"
        ? "No pudimos conectar con Google. Intenta de nuevo."
        : null,
  );
  const [confirmar, setConfirmar] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [vuelta, setVuelta] = useState(0);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (captchaActivo && !captcha) return setError("Espera a que termine la verificación de abajo.");
    iniciar(async () => {
      const r =
        modo === "crear"
          ? await crearCuenta(nombre, email, password, siguiente, captcha)
          : await entrar(email, password, siguiente, captcha);
      // El token ya se usó: pide uno nuevo para el siguiente intento.
      setCaptcha(null);
      setVuelta((v) => v + 1);
      if (!r.ok) return setError(r.error);
      if ("confirmar" in r) return setConfirmar(r.email);
      router.replace(r.destino);
      router.refresh();
    });
  }

  if (confirmar) {
    return (
      <div className="rounded-3xl bg-superficie px-6 py-12 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-white">
          <MailCheck aria-hidden size={28} className="text-vino-700" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">Revisa tu correo</h1>
        <p className="mx-auto mt-2 max-w-xs text-suave">
          Te enviamos un enlace a <strong className="text-foreground">{confirmar}</strong>. Ábrelo desde este
          celular para activar tu cuenta.
        </p>
        <p className="mt-4 text-sm text-suave">Si no llega en unos minutos, revisa la carpeta de spam.</p>
      </div>
    );
  }

  const creando = modo === "crear";

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div>
        <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
          {creando ? "Crea tu cuenta" : "Entra a tu cuenta"}
        </h1>
        <p className="mt-1 text-suave">
          {creando
            ? "Para pedir a los negocios de Nuevo Progreso."
            : "Para pedir, seguir tus pedidos o administrar tu negocio."}
        </p>
      </div>

      <BotonGoogle siguiente={siguiente} />
      <div className="flex items-center gap-3 text-sm text-suave">
        <span className="h-px flex-1 bg-borde" />o con tu correo<span className="h-px flex-1 bg-borde" />
      </div>

      <div role="tablist" aria-label="Tipo de acceso" className="grid grid-cols-2 rounded-full bg-superficie p-1">
        {(["entrar", "crear"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={modo === m}
            onClick={() => {
              setModo(m);
              setError(null);
            }}
            className={`h-10 rounded-full text-sm font-semibold transition-colors ${
              modo === m ? "bg-white shadow-sm" : "text-suave"
            }`}
          >
            {m === "entrar" ? "Ya tengo cuenta" : "Soy nuevo"}
          </button>
        ))}
      </div>

      {creando && (
        <Campo etiqueta="Tu nombre" id="nombre">
          <input
            id="nombre"
            autoComplete="name"
            required
            maxLength={120}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={estiloCampo}
          />
        </Campo>
      )}
      <Campo etiqueta="Correo" id="email">
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
      <Campo etiqueta="Contraseña" id="password" ayuda={creando ? "Mínimo 8 caracteres." : undefined}>
        <div className="relative">
          <input
            id="password"
            type={verPassword ? "text" : "password"}
            autoComplete={creando ? "new-password" : "current-password"}
            required
            minLength={creando ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${estiloCampo} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-suave"
          >
            {verPassword ? <EyeOff aria-hidden size={20} /> : <Eye aria-hidden size={20} />}
          </button>
        </div>
      </Campo>
      {!creando && (
        <Link href="/entrar/recuperar" className="-mt-2 inline-block text-sm font-semibold text-vino-700 underline-offset-2 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      )}

      <Captcha key={vuelta} onToken={setCaptcha} />
      {error && <Aviso>{error}</Aviso>}

      <button
        type="submit"
        disabled={enviando}
        className="flex h-14 w-full items-center justify-center rounded-full bg-vino-700 text-base font-semibold text-white hover:bg-vino-800 disabled:opacity-50"
      >
        {enviando ? "Un momento…" : creando ? "Crear cuenta" : "Entrar"}
      </button>
      <AceptacionLegal accion="continuar" className="text-center" />


    </form>
  );
}
