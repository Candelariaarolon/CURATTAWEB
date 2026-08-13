"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TexturedSection from "@/components/TexturedSection";

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificarEmailContent />
    </Suspense>
  );
}

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const email = searchParams.get("email") ?? "";

  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  const reenviar = async () => {
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
      <div className="mx-auto max-w-sm px-6 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
          Curatta
        </p>

        {status === "success" && (
          <>
            <h1 className="mt-5 font-serif text-3xl text-carbon">¡Cuenta confirmada!</h1>
            <p className="mt-5 text-[15px] leading-relaxed text-carbon/70">
              Ya podés iniciar sesión con tu email y contraseña.
            </p>
            <Link href="/login?verified=1" className="btn-curatta mt-8 inline-flex">
              Iniciar sesión
            </Link>
          </>
        )}

        {status === "expired" && (
          <>
            <h1 className="mt-5 font-serif text-3xl text-carbon">El link expiró</h1>
            <p className="mt-5 text-[15px] leading-relaxed text-carbon/70">
              Los links de confirmación valen por 24 horas. Pedí uno nuevo.
            </p>
            {reenviado ? (
              <p className="mt-8 text-sm text-carbon/70">Te reenviamos el mail de confirmación.</p>
            ) : (
              <button
                type="button"
                onClick={reenviar}
                disabled={reenviando || !email}
                className="btn-curatta mt-8 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reenviando ? "Reenviando…" : "Reenviar mail de confirmación"}
              </button>
            )}
          </>
        )}

        {(status === "invalid" || !status) && (
          <>
            <h1 className="mt-5 font-serif text-3xl text-carbon">Link inválido</h1>
            <p className="mt-5 text-[15px] leading-relaxed text-carbon/70">
              Este link de confirmación no es válido. Si ya tenés una cuenta sin
              confirmar, pedí un mail nuevo desde el login.
            </p>
            <Link href="/login" className="btn-curatta mt-8 inline-flex">
              Ir a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </TexturedSection>
  );
}
