import Link from "next/link";
import TexturedSection from "@/components/TexturedSection";

export default function TiendanubeErrorPage() {
  return (
    <TexturedSection
      texture="stone"
      overlay="piedra"
      overlayOpacity={0.9}
      className="min-h-screen py-24"
    >
      <div className="mx-auto max-w-md px-6 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
          Curatta
        </p>
        <h1 className="mt-5 font-serif text-3xl text-carbon">
          No pudimos conectar tu tienda
        </h1>
        <p className="mt-4 text-sm text-carbon/70">
          Algo falló durante la conexión con Tiendanube. Volvé a intentar la
          instalación de la app desde tu panel de Tiendanube.
        </p>
        <Link href="/" className="btn-curatta mt-8 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </TexturedSection>
  );
}
