"use client";

import { useCallback, useEffect, useState } from "react";
import TablerosManager, { type Board } from "./TablerosManager";
import GuardarEnColeccionButton from "@/components/shared/GuardarEnColeccionButton";
import { formatARS } from "@/lib/format";
import type { MatchResult, ProductoConScore } from "@/lib/matching-tiendanube";

type EstadoConexion = "loading" | "not-connected" | "expired" | "error" | "ready";

type Producto = {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  link: string;
};

function aProducto(p: ProductoConScore): Producto {
  return {
    id: String(p.id),
    nombre: p.nombre,
    marca: p.tipo_prenda,
    precio: p.precio,
    imagen: p.imagen,
    link: p.link,
  };
}

type Vista = "todos" | "tablero";

export default function ParaTiContent() {
  const [conexion, setConexion] = useState<EstadoConexion>("loading");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[] | null>(null);
  const [manejarTableros, setManejarTableros] = useState(false);

  const [vista, setVista] = useState<Vista>("todos");
  const [tableroElegidoId, setTableroElegidoId] = useState<string | null>(null);

  const [cargandoRecs, setCargandoRecs] = useState(false);
  const [resultados, setResultados] = useState<Producto[] | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargarBoards = useCallback(async () => {
    setConexion("loading");
    try {
      const res = await fetch("/api/user/boards");
      if (res.status === 404) return setConexion("not-connected");
      if (res.status === 400) return setConexion("expired");
      if (!res.ok) return setConexion("error");

      const data = (await res.json()) as {
        boards: Board[];
        selectedBoardIds: string[] | null;
      };
      setBoards(data.boards);
      setSelectedBoardIds(data.selectedBoardIds);
      setConexion("ready");
    } catch {
      setConexion("error");
    }
  }, []);

  useEffect(() => {
    cargarBoards();
  }, [cargarBoards]);

  const cargarRecomendaciones = useCallback(async (url: string, mensajeSinDatos: string) => {
    setCargandoRecs(true);
    setMensaje(null);
    try {
      const res = await fetch(url);
      const data = (await res.json()) as MatchResult & {
        error?: string;
        needsSelection?: boolean;
      };

      if (!res.ok || data.error) {
        setResultados([]);
        setMensaje(data.error ?? "No pudimos generar tus recomendaciones");
        return;
      }
      if (data.needsSelection) return;

      const productos = data.matches
        .flatMap((g) => g.productos)
        .sort((a, b) => b.score - a.score)
        .map(aProducto);

      setResultados(productos);
      if (productos.length === 0) {
        setMensaje(data.mensaje ?? mensajeSinDatos);
      }
    } catch {
      setResultados([]);
      setMensaje("Ocurrió un error generando tus recomendaciones");
    } finally {
      setCargandoRecs(false);
    }
  }, []);

  useEffect(() => {
    if (conexion !== "ready" || selectedBoardIds == null) return;

    if (vista === "todos") {
      cargarRecomendaciones(
        "/api/para-ti",
        "No encontramos prendas parecidas a tus tableros en el catálogo actual"
      );
    } else if (vista === "tablero" && tableroElegidoId) {
      cargarRecomendaciones(
        `/api/tablero-recomendaciones/${tableroElegidoId}?limit=25`,
        "No encontramos prendas parecidas a este tablero en el catálogo actual"
      );
    }
  }, [conexion, selectedBoardIds, vista, tableroElegidoId, cargarRecomendaciones]);

  if (conexion === "loading") return null;

  if (conexion === "not-connected" || conexion === "expired" || conexion === "error") {
    return (
      <div className="py-20 text-center">
        <p className="mb-6 text-[14px] text-negro/60">
          Conectá tu Pinterest para que Curatta arme recomendaciones a tu medida.
        </p>
        <a
          href="/api/auth/pinterest?returnTo=/para-ti"
          className="inline-block rounded-sm border border-negro bg-negro px-8 py-4 text-[13px] tracking-[0.5px] text-crema transition-opacity duration-300 ease-in-out hover:opacity-80"
        >
          {conexion === "expired" ? "Reconectar Pinterest" : "Conectar Pinterest"}
        </a>
      </div>
    );
  }

  // Primera vez conectando: todavía no eligió qué tableros sumar a Curatta.
  if (selectedBoardIds == null) {
    return (
      <div className="px-6 py-16 md:px-12">
        <TablerosManager
          boards={boards}
          seleccionInicial={[]}
          titulo="Elegí tus tableros de inspiración"
          copy="Antes de mostrarte recomendaciones, elegí qué tableros de Pinterest querés sumar a Curatta como inspiración de ropa. Vas a poder agregar o sacar tableros después, cuando quieras."
          onGuardado={(ids) => setSelectedBoardIds(ids)}
        />
      </div>
    );
  }

  const tablerosConectados = boards.filter((b) => selectedBoardIds.includes(b.id));

  return (
    <div className="px-6 py-11 md:px-12">
      <div className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => setVista("todos")}
          className={`rounded-full border px-[18px] py-2 text-[13px] ${
            vista === "todos"
              ? "border-negro bg-negro text-crema"
              : "border-negro/25 text-negro hover:border-negro"
          }`}
        >
          Todos mis tableros
        </button>
        <button
          type="button"
          onClick={() => {
            setVista("tablero");
            setTableroElegidoId((actual) => actual ?? tablerosConectados[0]?.id ?? null);
          }}
          disabled={tablerosConectados.length === 0}
          className={`rounded-full border px-[18px] py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-40 ${
            vista === "tablero"
              ? "border-negro bg-negro text-crema"
              : "border-negro/25 text-negro hover:border-negro"
          }`}
        >
          Por tablero
        </button>

        {vista === "tablero" && (
          <select
            value={tableroElegidoId ?? ""}
            onChange={(e) => setTableroElegidoId(e.target.value)}
            className="rounded-full border border-negro/25 bg-crema px-4 py-2 text-[13px] text-negro"
          >
            {tablerosConectados.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mx-auto mb-10 flex max-w-6xl justify-center">
        <button
          type="button"
          onClick={() => setManejarTableros((v) => !v)}
          className="rounded-full border border-negro/25 px-6 py-2.5 text-[13px] text-negro hover:border-negro"
        >
          Mis tableros conectados{" "}
          <span className="text-negro/45">
            ({selectedBoardIds.length}/{boards.length})
          </span>
        </button>
      </div>

      {manejarTableros && (
        <div className="mx-auto mb-12 max-w-xl">
          <TablerosManager
            boards={boards}
            seleccionInicial={selectedBoardIds}
            onCerrar={() => setManejarTableros(false)}
            onGuardado={(ids) => {
              setSelectedBoardIds(ids);
              setManejarTableros(false);
              if (ids.length === 0) {
                setVista("todos");
                setTableroElegidoId(null);
              } else {
                setTableroElegidoId((actual) => (actual && ids.includes(actual) ? actual : ids[0]));
              }
            }}
          />
        </div>
      )}

      {cargandoRecs ? (
        <p className="py-16 text-center text-[13px] italic text-negro/45">
          Armando tus recomendaciones…
        </p>
      ) : mensaje ? (
        <p className="py-16 text-center text-[13px] italic text-negro/50">{mensaje}</p>
      ) : resultados && resultados.length > 0 ? (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-7 sm:grid-cols-3 md:grid-cols-4">
          {resultados.map((p) => (
            <article
              key={p.id}
              className="relative rounded bg-crema shadow-[0_10px_24px_rgba(23,19,15,0.08)] transition-transform duration-200 ease-in-out hover:-translate-y-1"
            >
              <GuardarEnColeccionButton
                producto={{
                  productoId: p.id,
                  nombre: p.nombre,
                  marca: p.marca,
                  precio: p.precio,
                  imagen: p.imagen,
                  link: p.link,
                }}
              />
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[3/4] overflow-hidden rounded-t"
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
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  <h4 className="mb-1.5 text-[13.5px] text-negro">{p.nombre}</h4>
                </a>
                <p className="font-serif text-[15px] font-semibold text-negro">
                  {formatARS(p.precio)}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
