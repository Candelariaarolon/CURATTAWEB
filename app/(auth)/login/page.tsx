"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TexturedSection from "@/components/TexturedSection";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  const recienVerificado = searchParams.get("verified") === "1";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; needsVerification?: boolean };

      if (!res.ok) {
        setError(data.error ?? "Email o contraseña incorrectos");
        setNeedsVerification(Boolean(data.needsVerification));
        return;
      }

      // Recarga completa (no router.push) para que el estado de sesión del
      // cliente se hidrate de cero desde /api/auth/me.
      window.location.href = "/explorar";
    } finally {
      setLoading(false);
    }
  };

  const reenviarVerificacion = async () => {
    setReenviando(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setReenviado(true);
    } finally {
      setReenviando(false);
    }
  };

  return (
    <TexturedSection texture="kraft" overlay="hueso" overlayOpacity={0.9} className="min-h-screen py-24">
      <div className="mx-auto max-w-sm px-6">
        <header className="text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Curatta
          </p>
          <h1 className="mt-5 font-serif text-3xl text-carbon">Iniciar sesión</h1>
        </header>

        {recienVerificado && (
          <p className="mt-6 text-center text-sm text-carbon/70" role="status">
            ¡Cuenta confirmada! Ya podés iniciar sesión.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-left">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-carbon/60">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-carbon/30 bg-blanco-roto px-4 py-3 text-sm text-carbon outline-none transition duration-300 ease-in-out focus:border-carbon"
              style={{ borderRadius: "2px" }}
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-carbon/60">
                Contraseña
              </span>
              <Link href="/olvide-mi-contrasena" className="text-[11px] text-carbon/50 underline underline-offset-4 hover:text-carbon">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-carbon/30 bg-blanco-roto px-4 py-3 text-sm text-carbon outline-none transition duration-300 ease-in-out focus:border-carbon"
              style={{ borderRadius: "2px" }}
            />
          </label>

          {error && (
            <div className="text-center text-sm text-red-800" role="alert">
              <p>{error}</p>
              {needsVerification &&
                (reenviado ? (
                  <p className="mt-2 text-carbon/70">Te reenviamos el mail de confirmación.</p>
                ) : (
                  <button
                    type="button"
                    onClick={reenviarVerificacion}
                    disabled={reenviando}
                    className="mt-2 underline underline-offset-4 disabled:opacity-50"
                  >
                    {reenviando ? "Reenviando…" : "Reenviar mail de verificación"}
                  </button>
                ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-curatta mt-4 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-carbon/70">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="underline underline-offset-4 hover:text-carbon">
            Registrate
          </Link>
        </p>
      </div>
    </TexturedSection>
  );
}
