"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "@/components/AuthSessionProvider";

type Tab = "explorar" | "para-ti" | "colecciones";

const TABS: { key: Tab; label: string; href: string }[] = [
  { key: "explorar", label: "Explorar", href: "/explorar" },
  { key: "para-ti", label: "Para ti", href: "/para-ti" },
  { key: "colecciones", label: "Mis colecciones", href: "/mis-colecciones" },
];

export default function AppHeader({ active }: { active: Tab }) {
  const { data: session } = useSession();
  const [cuentaAbierta, setCuentaAbierta] = useState(false);

  return (
    <>
      <header className="flex items-center gap-6 border-b border-crema/10 bg-negro px-6 py-5 md:px-12">
        <Link href="/explorar" className="whitespace-nowrap font-serif text-lg tracking-[0.3em] text-crema">
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

        <div className="relative ml-auto">
          {session ? (
            <>
              <button
                type="button"
                onClick={() => setCuentaAbierta((v) => !v)}
                className="whitespace-nowrap text-[13px] tracking-[0.3px] text-crema/90 hover:text-crema"
              >
                Mi cuenta
              </button>

              {cuentaAbierta && (
                <div className="absolute right-0 top-full z-20 mt-3 min-w-[200px] rounded-sm border border-crema/15 bg-marron-oscuro px-4 py-3 text-[13px] text-crema/80 shadow-[0_16px_32px_rgba(0,0,0,0.35)]">
                  {session.user?.email && (
                    <p className="mb-2 truncate border-b border-crema/10 pb-2 text-crema/60">
                      {session.user.email}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="underline underline-offset-4 hover:text-crema"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="whitespace-nowrap text-[13px] tracking-[0.3px] text-crema/85">
              <Link href="/registro" className="hover:text-crema">
                Registrate
              </Link>
              <span aria-hidden="true">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <Link href="/login" className="hover:text-crema">
                Iniciá sesión
              </Link>
            </div>
          )}
        </div>
      </header>

      <nav className="flex gap-9 overflow-x-auto border-b border-crema/10 bg-marron-oscuro px-6 py-4 text-[13.5px] tracking-[0.3px] md:px-12">
        {TABS.map((tab) =>
          tab.key === active ? (
            <span
              key={tab.key}
              className="whitespace-nowrap border-b border-beige pb-[3px] font-semibold text-crema"
            >
              {tab.label}
            </span>
          ) : (
            <Link key={tab.key} href={tab.href} className="whitespace-nowrap text-crema/50 hover:text-crema/80">
              {tab.label}
            </Link>
          )
        )}
      </nav>
    </>
  );
}
