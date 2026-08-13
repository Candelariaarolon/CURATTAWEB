"use client";

import { useState } from "react";

export type Board = { id: string; name: string; description: string; pinCount: number };

type Props = {
  boards: Board[];
  seleccionInicial: string[];
  onGuardado: (boardIds: string[]) => void;
  onCerrar?: () => void;
  titulo?: string;
  copy?: string;
};

export default function TablerosManager({
  boards,
  seleccionInicial,
  onGuardado,
  onCerrar,
  titulo = "Mis tableros conectados",
  copy = "Elegí los tableros de Pinterest que querés sumar a Curatta como inspiración de ropa. Podés agregar o sacar tableros cuando quieras.",
}: Props) {
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set(seleccionInicial));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const boardIds = Array.from(seleccion);
      const res = await fetch("/api/user/boards/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardIds }),
      });
      if (!res.ok) {
        setError("No se pudo guardar la selección");
        return;
      }
      onGuardado(boardIds);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-sm border border-negro/15 bg-crema px-6 py-8 sm:px-10">
      <h2 className="font-serif text-2xl text-negro">{titulo}</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-negro/70">{copy}</p>

      {boards.length === 0 ? (
        <p className="mt-8 text-center text-[13px] italic text-negro/45">
          No encontramos tableros en tu cuenta de Pinterest.
        </p>
      ) : (
        <div className="mt-7 max-h-80 space-y-1 overflow-y-auto">
          {boards.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-[14px] text-negro hover:bg-negro/5"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={seleccion.has(b.id)}
                  onChange={() => toggle(b.id)}
                  className="h-4 w-4 accent-negro"
                />
                {b.name}
              </span>
              <span className="text-[12px] text-negro/45">{b.pinCount} pines</span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-center text-sm text-red-800">{error}</p>}

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        {onCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 text-[13px] text-negro/60 hover:text-negro"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded-sm border border-negro bg-negro px-7 py-2.5 text-[13px] text-crema transition-opacity duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar selección"}
        </button>
      </div>
    </div>
  );
}
