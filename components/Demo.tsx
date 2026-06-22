"use client";

import { useState } from "react";
import TexturedSection from "./TexturedSection";
import { catalogo, type Producto } from "@/lib/catalogo";

const TABLERO: { id: number; url: string; alt: string }[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&auto=format&fit=crop",
    alt: "Look editorial con sombrero",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop",
    alt: "Outfit casual con mochila",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80&auto=format&fit=crop",
    alt: "Look con trench coat camel",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop",
    alt: "Outfit street style minimalista",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop",
    alt: "Look con suéter beige",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80&auto=format&fit=crop",
    alt: "Look editorial blanco y negro",
  },
];

const formatARS = (n: number) =>
  `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

type Analisis = {
  tipo: string;
  color: string;
  estampado: string;
  estilo: string;
};

export default function Demo() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [resultados, setResultados] = useState<Producto[] | null>(null);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);

  const analizar = async (boardId: number, imageUrl: string) => {
    if (loadingId !== null) return;
    setLoadingId(boardId);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = (await res.json()) as Analisis & { ranked_ids: number[] };
      setAnalisis(data);

      const byId = new Map(catalogo.map((p) => [p.id, p]));
      const matched = (data.ranked_ids ?? [])
        .map((id) => byId.get(id))
        .filter((p): p is Producto => Boolean(p));
      setResultados(matched);

      setTimeout(() => {
        document
          .getElementById("demo-resultados")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (err) {
      console.error("Error analizando imagen:", err);
      setAnalisis({ tipo: "—", color: "—", estampado: "—", estilo: "—" });
      setResultados([]);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <TexturedSection
      texture="kraft"
      overlay="hueso"
      overlayOpacity={0.9}
      className="py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <header className="text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-cuero-dark">
            Demostración
          </p>
          <h2 className="mt-5 font-serif text-3xl text-carbon md:text-5xl">
            Tablero de prueba
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-carbon/70">
            Tocá cualquier imagen para que Curatta analice el look con
            inteligencia artificial y encuentre prendas similares disponibles
            para comprar.
          </p>
        </header>

        <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {TABLERO.map((item) => {
            const isLoading = loadingId === item.id;
            const isDisabled = loadingId !== null && !isLoading;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => analizar(item.id, item.url)}
                disabled={isDisabled}
                aria-label={`Analizar: ${item.alt}`}
                className="group relative aspect-[3/4] overflow-hidden border border-carbon/15 bg-blanco-roto transition duration-300 ease-in-out hover:border-carbon/40 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderRadius: "2px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-full w-full object-cover transition duration-500 ease-in-out group-hover:scale-[1.02]"
                  loading="lazy"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-carbon/75 px-4 text-center">
                    <div
                      aria-hidden="true"
                      className="h-6 w-6 animate-spin border border-hueso/30 border-t-hueso"
                      style={{ borderRadius: "50%" }}
                    />
                    <p className="mt-4 font-sans text-xs uppercase tracking-[0.3em] text-hueso">
                      Analizando imagen…
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div id="demo-resultados" className="scroll-mt-12">
          {resultados && (
            <div className="mt-16 border-t border-carbon/10 pt-12">
              <div className="text-center">
                <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-cuero-dark">
                  Resultados
                </p>
                <h3 className="mt-3 font-serif text-2xl text-carbon md:text-3xl">
                  {resultados.length > 0
                    ? "Prendas similares para comprar"
                    : "No encontramos coincidencias"}
                </h3>
                {analisis && (
                  <p className="mt-4 font-sans text-xs uppercase tracking-[0.25em] text-carbon/55">
                    {analisis.tipo} · {analisis.color} · {analisis.estampado} ·{" "}
                    {analisis.estilo}
                  </p>
                )}
              </div>

              {resultados.length > 0 && (
                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                  {resultados.map((p) => (
                    <article
                      key={p.id}
                      className="flex flex-col border border-carbon/15 bg-blanco-roto"
                      style={{ borderRadius: "2px" }}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden border-b border-carbon/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h4 className="font-serif text-lg leading-snug text-carbon">
                          {p.nombre}
                        </h4>
                        <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.25em] text-carbon/55">
                          {p.tipo} · {p.color}
                        </p>
                        <p className="mt-4 font-serif text-xl text-carbon">
                          {formatARS(p.precio)}
                        </p>
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center justify-center border border-carbon bg-transparent px-5 py-2.5 text-center font-sans text-xs uppercase tracking-[0.2em] text-carbon transition duration-300 ease-in-out hover:bg-carbon hover:text-hueso"
                          style={{ borderRadius: "2px" }}
                        >
                          Ver en Mercado Libre
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TexturedSection>
  );
}
