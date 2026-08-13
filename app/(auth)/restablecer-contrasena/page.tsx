"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TexturedSection from "@/components/TexturedSection";

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <RestablecerContrasenaForm />
    </Suspense>
  );
}

function RestablecerContrasenaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo restablecer la contraseña");
        return;
      }

      setListo(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <TexturedSection texture="kraft" overlay="hueso" overlayOpacity={0.9} className="min-h-screen py-24">
        <div className="mx-auto max-w-sm px-6 text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Curatta
          </p>
          <h1 className="mt-5 font-serif text-3xl text-carbon">Link inválido</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-carbon/70">
            Este link no tiene un token válido. Pedí uno nuevo desde{" "}
            <Link href="/olvide-mi-contrasena" className="underline underline-offset-4">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>
      </TexturedSection>
    );
  }

  if (listo) {
    return (
      <TexturedSection texture="kraft" overlay="hueso" overlayOpacity={0.9} className="min-h-screen py-24">
        <div className="mx-auto max-w-sm px-6 text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Curatta
          </p>
          <h1 className="mt-5 font-serif text-3xl text-carbon">Contraseña actualizada</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-carbon/70">
            Ya podés iniciar sesión con tu nueva contraseña.
          </p>
          <Link href="/login" className="btn-curatta mt-8 inline-flex">
            Iniciar sesión
          </Link>
        </div>
      </TexturedSection>
    );
  }

  return (
    <TexturedSection texture="kraft" overlay="hueso" overlayOpacity={0.9} className="min-h-screen py-24">
      <div className="mx-auto max-w-sm px-6">
        <header className="text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Curatta
          </p>
          <h1 className="mt-5 font-serif text-3xl text-carbon">Elegí una nueva contraseña</h1>
        </header>

        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-left">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-carbon/60">
              Nueva contraseña
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-carbon/30 bg-blanco-roto px-4 py-3 text-sm text-carbon outline-none transition duration-300 ease-in-out focus:border-carbon"
              style={{ borderRadius: "2px" }}
            />
            <span className="text-xs text-carbon/50">Mínimo 8 caracteres</span>
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-carbon/60">
              Confirmar contraseña
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="border border-carbon/30 bg-blanco-roto px-4 py-3 text-sm text-carbon outline-none transition duration-300 ease-in-out focus:border-carbon"
              style={{ borderRadius: "2px" }}
            />
          </label>

          {error && (
            <p className="text-center text-sm text-red-800" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-curatta mt-4 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Guardando…" : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </TexturedSection>
  );
}
