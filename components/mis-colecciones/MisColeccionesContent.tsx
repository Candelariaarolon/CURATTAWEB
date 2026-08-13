"use client";

import { useState } from "react";
import { useColecciones } from "@/components/shared/ColeccionesProvider";
import ColeccionTile from "./ColeccionTile";
import { formatARS } from "@/lib/format";

export default function MisColeccionesContent() {
  const { colecciones, cargando, crearColeccion, eliminarDeColeccion } = useColecciones();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [nombreNueva, setNombreNueva] = useState("");
  const [creando, setCreando] = useState(false);

  const seleccionada = colecciones.find((c) => c.id === seleccionadaId) ?? null;

  const crear = async () => {
    const nombre = nombreNueva.trim();
    if (!nombre) return;
    setCreando(true);
    try {
      const id = await crearColeccion(nombre);
      setNombreNueva("");
      setSeleccionadaId(id);
    } finally {
      setCreando(false);
    }
  };

  if (cargando) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-11 md:px-12">
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
        <input
          value={nombreNueva}
          onChange={(e) => setNombreNueva(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crear()}
          placeholder="Nombre de la nueva colección"
          className="rounded-sm border border-negro/20 bg-crema px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={crear}
          disabled={creando || !nombreNueva.trim()}
          className="rounded-sm border border-negro bg-negro px-6 py-2.5 text-sm text-crema transition-opacity duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creando ? "Creando…" : "+ Nueva colección"}
        </button>
      </div>

      {colecciones.length === 0 ? (
        <p className="py-16 text-center text-[13px] italic text-negro/45">
          Todavía no creaste ninguna colección. Guardá items desde Explorar o Para ti, o
          creá una acá arriba.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {colecciones.map((c) => (
            <ColeccionTile
              key={c.id}
              coleccion={c}
              seleccionada={c.id === seleccionadaId}
              onClick={() => setSeleccionadaId(c.id === seleccionadaId ? null : c.id)}
            />
          ))}
        </div>
      )}

      {seleccionada && (
        <div className="mt-14 border-t border-negro/10 pt-10">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-serif text-xl text-negro">{seleccionada.nombre}</h3>
            <button
              type="button"
              onClick={() => setSeleccionadaId(null)}
              className="text-[12px] text-negro/50 underline underline-offset-4 hover:text-negro"
            >
              Cerrar
            </button>
          </div>

          {seleccionada.items.length === 0 ? (
            <p className="text-center text-[13px] italic text-negro/45">
              Esta colección todavía no tiene productos. Guardalos desde Explorar o Para ti
              con el botón “+” de cada item.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {seleccionada.items.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded bg-crema shadow-[0_10px_24px_rgba(23,19,15,0.08)]"
                >
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-[3/4] overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                  <div className="px-4 pb-[18px] pt-3.5">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.6px] text-tierra">
                      {p.marca}
                    </p>
                    <h4 className="mb-1.5 text-[13.5px] text-negro">{p.nombre}</h4>
                    <p className="mb-2 font-serif text-[15px] font-semibold text-negro">
                      {formatARS(p.precio)}
                    </p>
                    <button
                      type="button"
                      onClick={() => eliminarDeColeccion(seleccionada.id, p.id)}
                      className="text-left text-[11px] uppercase tracking-[0.15em] text-negro/45 underline underline-offset-4 hover:text-negro"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
