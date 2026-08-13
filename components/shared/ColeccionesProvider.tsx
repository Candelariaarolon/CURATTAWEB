"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/components/AuthSessionProvider";

export type ItemColeccion = {
  id: string;
  productoId: string;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  link: string;
};

export type Coleccion = {
  id: string;
  nombre: string;
  items: ItemColeccion[];
};

export type ProductoGuardable = {
  productoId: string;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  link: string;
};

type Ctx = {
  colecciones: Coleccion[];
  cargando: boolean;
  crearColeccion: (nombre: string) => Promise<string>;
  agregarAColeccion: (coleccionId: string, producto: ProductoGuardable) => Promise<void>;
  eliminarDeColeccion: (coleccionId: string, itemId: string) => Promise<void>;
};

const ColeccionesContext = createContext<Ctx | null>(null);

export function ColeccionesProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [colecciones, setColecciones] = useState<Coleccion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setCargando(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/colecciones");
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as { colecciones: Coleccion[] };
        setColecciones(data.colecciones);
      } finally {
        if (!cancelled) setCargando(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const crearColeccion = useCallback(async (nombre: string) => {
    const res = await fetch("/api/colecciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    if (!res.ok) throw new Error("No se pudo crear la colección");
    const data = (await res.json()) as { coleccion: Coleccion };
    setColecciones((prev) => [...prev, data.coleccion]);
    return data.coleccion.id;
  }, []);

  const agregarAColeccion = useCallback(
    async (coleccionId: string, producto: ProductoGuardable) => {
      const res = await fetch(`/api/colecciones/${coleccionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
      if (!res.ok) throw new Error("No se pudo guardar el producto");
      const data = (await res.json()) as { item: ItemColeccion };
      setColecciones((prev) =>
        prev.map((c) => {
          if (c.id !== coleccionId) return c;
          if (c.items.some((i) => i.productoId === producto.productoId)) return c;
          return { ...c, items: [data.item, ...c.items] };
        })
      );
    },
    []
  );

  const eliminarDeColeccion = useCallback(async (coleccionId: string, itemId: string) => {
    const res = await fetch(`/api/colecciones/${coleccionId}/items/${itemId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar el producto");
    setColecciones((prev) =>
      prev.map((c) =>
        c.id === coleccionId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
      )
    );
  }, []);

  const value = useMemo<Ctx>(
    () => ({ colecciones, cargando, crearColeccion, agregarAColeccion, eliminarDeColeccion }),
    [colecciones, cargando, crearColeccion, agregarAColeccion, eliminarDeColeccion]
  );

  return (
    <ColeccionesContext.Provider value={value}>{children}</ColeccionesContext.Provider>
  );
}

export function useColecciones() {
  const ctx = useContext(ColeccionesContext);
  if (!ctx) {
    throw new Error("useColecciones debe usarse dentro de <ColeccionesProvider>");
  }
  return ctx;
}
