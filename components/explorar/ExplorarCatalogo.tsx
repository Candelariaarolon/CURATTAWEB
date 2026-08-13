"use client";

import { useMemo, useState } from "react";
import type { ProductoTiendanube } from "@/lib/catalogo-tiendanube";
import CategoryPills, { CATEGORIA_TIPOS } from "./CategoryPills";
import OrdenarFiltrosBar, { type Filtros, type SortBy } from "./OrdenarFiltrosBar";
import ProductGrid from "./ProductGrid";

export default function ExplorarCatalogo({ productos }: { productos: ProductoTiendanube[] }) {
  const [categoria, setCategoria] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("relevancia");
  const [filtros, setFiltros] = useState<Filtros>({
    colores: [],
    precioMin: null,
    precioMax: null,
  });

  const coloresDisponibles = useMemo(
    () => Array.from(new Set(productos.map((p) => p.familia_color))).sort(),
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    let lista = productos;

    if (categoria) {
      const tipos = CATEGORIA_TIPOS[categoria] ?? [];
      lista = lista.filter((p) => tipos.includes(p.tipo_prenda));
    }
    if (filtros.colores.length > 0) {
      lista = lista.filter((p) => filtros.colores.includes(p.familia_color));
    }
    if (filtros.precioMin != null) {
      lista = lista.filter((p) => p.precio >= filtros.precioMin!);
    }
    if (filtros.precioMax != null) {
      lista = lista.filter((p) => p.precio <= filtros.precioMax!);
    }

    if (sortBy === "precio-asc") {
      lista = [...lista].sort((a, b) => a.precio - b.precio);
    } else if (sortBy === "precio-desc") {
      lista = [...lista].sort((a, b) => b.precio - a.precio);
    }

    return lista;
  }, [productos, categoria, filtros, sortBy]);

  return (
    <>
      <CategoryPills
        categoria={categoria}
        onCategoriaChange={setCategoria}
        extra={
          <OrdenarFiltrosBar
            sortBy={sortBy}
            onSortByChange={setSortBy}
            filtros={filtros}
            onFiltrosChange={setFiltros}
            coloresDisponibles={coloresDisponibles}
          />
        }
      />
      <ProductGrid productos={productosFiltrados} />
    </>
  );
}
