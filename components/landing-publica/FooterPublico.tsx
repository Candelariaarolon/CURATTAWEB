import Image from "next/image";
import Link from "next/link";

export default function FooterPublico() {
  return (
    <footer className="relative isolate px-6 pb-10 pt-[70px] md:px-12">
      <Image
        src="/textures/kateryna-hliznitsova-2NDtPNiLcD0-unsplash.jpg"
        alt=""
        fill
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,248,243,0.85),rgba(251,248,243,0.9))]" />

      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 border-t border-negro/15 pt-8">
        <p className="font-serif text-lg tracking-[0.3em] text-negro">CURATTA</p>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs text-marron-oscuro/65">
          <p>De tu tablero, a tu placard.</p>
          <Link href="/privacidad" className="underline underline-offset-4 hover:text-marron-oscuro">
            Política de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
