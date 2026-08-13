"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import TexturedSection from "@/components/TexturedSection";

export default function OlvideMiContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Mensaje genérico siempre, exista o no el email — así no se puede
      // usar este form para confirmar qué emails están registrados.
      setEnviado(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TexturedSection texture="kraft" overlay="hueso" overlayOpacity={0.9} className="min-h-screen py-24">
      <div className="mx-auto max-w-sm px-6">
        <header className="text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Curatta
          </p>
          <h1 className="mt-5 font-serif text-3xl text-carbon">¿Olvidaste tu contraseña?</h1>
        </header>

        {enviado ? (
          <p className="mt-8 text-center text-[15px] leading-relaxed text-carbon/70">
            Si <strong>{email}</strong> tiene una cuenta en Curatta, te enviamos un
            link para restablecer tu contraseña.
          </p>
        ) : (
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

            <button type="submit" disabled={loading} className="btn-curatta mt-4 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Enviando…" : "Enviar link"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-carbon/70">
          <Link href="/login" className="underline underline-offset-4 hover:text-carbon">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </TexturedSection>
  );
}
