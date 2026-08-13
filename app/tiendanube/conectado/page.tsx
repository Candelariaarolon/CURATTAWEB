import Link from "next/link";
import TexturedSection from "@/components/TexturedSection";

export default function TiendanubeConectadoPage() {
  return (
    <TexturedSection
      texture="kraft"
      overlay="hueso"
      overlayOpacity={0.9}
      className="min-h-screen py-24"
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
          Curatta
        </p>
        <h1 className="mt-5 font-serif text-3xl text-carbon">
          ¡Tu tienda fue conectada a Curatta con éxito!
        </h1>
        <p className="mt-4 text-sm text-carbon/70">
          Ya podemos empezar a traer tu catálogo de Tiendanube y generar
          recomendaciones para tus clientas.
        </p>
        <Link href="/" className="btn-curatta mt-8 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </TexturedSection>
  );
}
