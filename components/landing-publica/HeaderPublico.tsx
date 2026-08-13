import Link from "next/link";

export default function HeaderPublico() {
  return (
    <>
      <header className="flex items-center gap-6 border-b border-crema/10 bg-negro px-6 py-5 md:px-12">
        <Link
          href="/"
          className="whitespace-nowrap font-serif text-lg tracking-[0.3em] text-crema underline decoration-crema/50 underline-offset-[6px]"
        >
          CURATTA
        </Link>

        <div className="hidden flex-1 items-center gap-2.5 rounded-full border border-crema/35 px-4 py-2 text-[13.5px] text-crema/60 sm:flex">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="shrink-0 opacity-70"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar artículos
        </div>

        <div className="ml-auto whitespace-nowrap text-[13px] tracking-[0.3px] text-crema/85">
          <Link href="/registro" className="hover:text-crema">
            Registrate
          </Link>
          <span aria-hidden="true">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
          <Link href="/login" className="hover:text-crema">
            Iniciá sesión
          </Link>
        </div>
      </header>

      <nav className="flex gap-9 overflow-x-auto border-b border-crema/10 bg-marron-oscuro px-6 py-4 text-[13.5px] tracking-[0.3px] md:px-12">
        <Link href="/login" className="whitespace-nowrap text-crema/75 hover:text-crema">
          Explorar
        </Link>
        <Link href="/login" className="whitespace-nowrap text-crema/75 hover:text-crema">
          Para ti
        </Link>
        <Link href="/login" className="whitespace-nowrap text-crema/75 hover:text-crema">
          Mis colecciones
        </Link>
      </nav>
    </>
  );
}
