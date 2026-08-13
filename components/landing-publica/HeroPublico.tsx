import Image from "next/image";
import Link from "next/link";

export default function HeroPublico() {
  return (
    <section className="relative isolate flex min-h-[82vh] items-center px-6 md:px-12">
      <Image
        src="/textures/linen.jpg"
        alt=""
        fill
        priority
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,15,11,0.6)_0%,rgba(20,15,11,0.4)_45%,rgba(20,15,11,0.78)_100%)]" />

      <div className="mx-auto max-w-xl text-center text-crema">
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-beige">Curatta</p>

        <h1 className="mb-6 font-serif text-4xl leading-[1.12] sm:text-5xl md:text-[56px]">
          De tu tablero,
          <br />
          a tu <em className="italic">placard</em>
        </h1>

        <p className="mx-auto mb-9 max-w-md text-[16.5px] leading-relaxed text-crema/85">
          Conectá tu Pinterest o subí una foto de inspiración. Curatta
          encuentra las prendas reales, disponibles en tiendas argentinas.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="/login"
            className="rounded-sm border border-crema bg-crema px-8 py-4 text-[13px] tracking-[0.5px] text-negro transition-opacity duration-300 ease-in-out hover:opacity-80"
          >
            Conectar Pinterest
          </Link>
          <Link
            href="/registro"
            className="rounded-sm border border-crema px-8 py-4 text-[13px] tracking-[0.5px] text-crema transition-opacity duration-300 ease-in-out hover:opacity-80"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </section>
  );
}
