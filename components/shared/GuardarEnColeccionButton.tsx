"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/AuthSessionProvider";
import { useColecciones, type ProductoGuardable } from "./ColeccionesProvider";

export default function GuardarEnColeccionButton({ producto }: { producto: ProductoGuardable }) {
  const router = useRouter();
  const { status } = useSession();
  const { colecciones, crearColeccion, agregarAColeccion } = useColecciones();
  const [abierto, setAbierto] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const yaGuardado = colecciones.some((c) =>
    c.items.some((i) => i.productoId === producto.productoId)
  );

  const onClickBoton = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setAbierto((v) => !v);
  };

  const guardarEn = async (coleccionId: string) => {
    setGuardando(true);
    try {
      await agregarAColeccion(coleccionId, producto);
      setGuardado(true);
      setAbierto(false);
      setTimeout(() => setGuardado(false), 2000);
    } finally {
      setGuardando(false);
    }
  };

  const crearYGuardar = async () => {
    const nombre = nombreNueva.trim();
    if (!nombre) return;
    setGuardando(true);
    try {
      const id = await crearColeccion(nombre);
      await agregarAColeccion(id, producto);
      setNombreNueva("");
      setGuardado(true);
      setAbierto(false);
      setTimeout(() => setGuardado(false), 2000);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="absolute right-2.5 top-2.5 z-10 text-left">
      <button
        type="button"
        onClick={onClickBoton}
        aria-label="Guardar en una colección"
        className={`flex h-8 w-8 items-center justify-center rounded-full text-base leading-none shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-colors ${
          guardado || yaGuardado ? "bg-negro text-crema" : "bg-crema/90 text-negro hover:bg-crema"
        }`}
      >
        {guardado || yaGuardado ? "✓" : "+"}
      </button>

      {abierto && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAbierto(false);
            }}
          />
          <div
            className="absolute right-0 top-10 z-20 w-56 rounded-sm border border-negro/15 bg-blanco p-3 shadow-[0_16px_32px_rgba(23,19,15,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            {colecciones.length === 0 ? (
              <p className="mb-2 px-1 text-[12px] italic text-negro/45">
                Todavía no tenés colecciones.
              </p>
            ) : (
              <div className="mb-2 max-h-40 overflow-y-auto">
                {colecciones.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => guardarEn(c.id)}
                    disabled={guardando}
                    className="block w-full rounded-sm px-2 py-1.5 text-left text-[13px] text-negro hover:bg-negro/5 disabled:opacity-50"
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-1.5 border-t border-negro/10 pt-2">
              <input
                value={nombreNueva}
                onChange={(e) => setNombreNueva(e.target.value)}
                placeholder="Nueva colección"
                className="min-w-0 flex-1 rounded-sm border border-negro/20 px-2 py-1.5 text-[12.5px]"
              />
              <button
                type="button"
                onClick={crearYGuardar}
                disabled={guardando || !nombreNueva.trim()}
                className="shrink-0 rounded-sm bg-negro px-2.5 py-1.5 text-[12px] text-crema disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
