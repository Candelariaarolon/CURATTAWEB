"use client";

import { useState } from "react";

export type SortBy = "relevancia" | "precio-asc" | "precio-desc";

export type Filtros = {
  colores: string[];
  precioMin: number | null;
  precioMax: number | null;
};

const TALLES_PLACEHOLDER = ["Único", "S", "M", "L", "XL"];

function etiquetaColor(valor: string): string {
  return valor
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function OrdenarFiltrosBar({
  sortBy,
  onSortByChange,
  filtros,
  onFiltrosChange,
  coloresDisponibles,
}: {
  sortBy: SortBy;
  onSortByChange: (s: SortBy) => void;
  filtros: Filtros;
  onFiltrosChange: (f: Filtros) => void;
  coloresDisponibles: string[];
}) {
  const [ordenAbierto, setOrdenAbierto] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const filtrosActivos =
    filtros.colores.length + (filtros.precioMin != null ? 1 : 0) + (filtros.precioMax != null ? 1 : 0);

  const toggleColor = (color: string) => {
    const colores = filtros.colores.includes(color)
      ? filtros.colores.filter((c) => c !== color)
      : [...filtros.colores, color];
    onFiltrosChange({ ...filtros, colores });
  };

  const limpiarFiltros = () => {
    onFiltrosChange({ colores: [], precioMin: null, precioMax: null });
  };

  const OPCIONES_ORDEN: { key: SortBy; label: string }[] = [
    { key: "relevancia", label: "Relevancia" },
    { key: "precio-asc", label: "Precio: menor a mayor" },
    { key: "precio-desc", label: "Precio: mayor a menor" },
  ];

  return (
    <div className="flex shrink-0 gap-2.5">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOrdenAbierto((v) => !v);
            setFiltrosAbiertos(false);
          }}
          className="whitespace-nowrap rounded-full border border-negro/25 bg-transparent px-[18px] py-2 text-[13px] text-negro hover:border-negro"
        >
          Ordenar ▾
        </button>

        {ordenAbierto && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOrdenAbierto(false)} />
            <div className="absolute right-0 top-11 z-20 w-56 rounded-sm border border-negro/15 bg-blanco p-2 shadow-[0_16px_32px_rgba(23,19,15,0.2)]">
              {OPCIONES_ORDEN.map((op) => (
                <button
                  key={op.key}
                  type="button"
                  onClick={() => {
                    onSortByChange(op.key);
                    setOrdenAbierto(false);
                  }}
                  className={`block w-full rounded-sm px-3 py-2 text-left text-[13px] hover:bg-negro/5 ${
                    sortBy === op.key ? "font-semibold text-negro" : "text-negro/70"
                  }`}
                >
                  {sortBy === op.key ? "✓ " : ""}
                  {op.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setFiltrosAbiertos((v) => !v);
            setOrdenAbierto(false);
          }}
          className="whitespace-nowrap rounded-full border border-negro/25 bg-transparent px-[18px] py-2 text-[13px] text-negro hover:border-negro"
        >
          Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""} ▾
        </button>

        {filtrosAbiertos && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setFiltrosAbiertos(false)} />
            <div className="absolute right-0 top-11 z-20 w-72 space-y-5 rounded-sm border border-negro/15 bg-blanco p-4 shadow-[0_16px_32px_rgba(23,19,15,0.2)]">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-negro/50">Color</p>
                {coloresDisponibles.length === 0 ? (
                  <p className="text-[12px] italic text-negro/40">Sin colores cargados</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {coloresDisponibles.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`rounded-full border px-3 py-1 text-[12px] ${
                          filtros.colores.includes(color)
                            ? "border-negro bg-negro text-crema"
                            : "border-negro/25 text-negro"
                        }`}
                      >
                        {etiquetaColor(color)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-negro/50">Precio</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={filtros.precioMin ?? ""}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        precioMin: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="Mín."
                    className="w-full rounded-sm border border-negro/20 px-2.5 py-1.5 text-[13px]"
                  />
                  <span className="text-negro/40">–</span>
                  <input
                    type="number"
                    min={0}
                    value={filtros.precioMax ?? ""}
                    onChange={(e) =>
                      onFiltrosChange({
                        ...filtros,
                        precioMax: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="Máx."
                    className="w-full rounded-sm border border-negro/20 px-2.5 py-1.5 text-[13px]"
                  />
                </div>
              </div>

              <div className="opacity-50">
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-negro/50">Talle</p>
                <div className="flex flex-wrap gap-1.5">
                  {TALLES_PLACEHOLDER.map((t) => (
                    <span
                      key={t}
                      className="cursor-not-allowed rounded-full border border-negro/25 px-3 py-1 text-[12px] text-negro"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="opacity-50">
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-negro/50">Marca</p>
                <input
                  disabled
                  placeholder="Buscar marca…"
                  className="w-full cursor-not-allowed rounded-sm border border-negro/20 px-2.5 py-1.5 text-[13px]"
                />
              </div>
              <p className="-mt-2 text-[11px] italic text-negro/40">
                Talle y marca todavía no están cargados en el catálogo.
              </p>

              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full rounded-sm border border-negro/20 py-2 text-[12.5px] text-negro/60 hover:border-negro hover:text-negro"
              >
                Limpiar filtros
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
