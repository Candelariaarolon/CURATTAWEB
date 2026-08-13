import Image from "next/image";
import Link from "next/link";

const TILES = [
  "/productos/blazer-blanco.jpg",
  "/productos/top-crochet-marron.jpg",
  "/productos/vestido-rosa-brillos.jpg",
  "/productos/top-negro-encaje.jpg",
];

export default function ConectarPinterestSection() {
  return (
    <section className="relative isolate px-6 py-24 md:px-12 md:py-32">
      <Image
        src="/textures/fondoyuteoscuro.jpg"
        alt=""
        fill
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,17,14,0.72)_0%,rgba(20,17,14,0.55)_100%)]" />

      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-16 md:gap-20">
        <div className="w-[300px] flex-none rounded-[34px] bg-negro p-3.5 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
          <div className="rounded-[22px] bg-crema px-5 pb-6 pt-5">
            <p className="mb-4 text-center font-serif text-[13px] tracking-[0.3em] text-negro">
              CURATTA
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TILES.map((src) => (
                <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-md">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-[280px] flex-1 text-crema">
          <h2 className="mb-5 font-serif text-3xl leading-tight text-blanco md:text-[38px]">
            Conectá tu Pinterest,
            <br />
            o subí una foto
          </h2>
          <p className="mb-8 max-w-[420px] text-[15.5px] leading-relaxed text-crema/80">
            Elegí un tablero existente o subí una imagen desde tu cámara o
            galería — Curatta arma tu catálogo a partir de ahí.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              href="/login"
              className="rounded-sm border border-crema bg-crema px-8 py-4 text-[13px] tracking-[0.5px] text-negro transition-opacity duration-300 ease-in-out hover:opacity-80"
            >
              Conectar con Pinterest
            </Link>
            <Link
              href="/registro"
              className="rounded-sm border border-crema px-8 py-4 text-[13px] tracking-[0.5px] text-crema transition-opacity duration-300 ease-in-out hover:opacity-80"
            >
              Subir una foto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
