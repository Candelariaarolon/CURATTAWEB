import type { ReactNode } from "react";

const GENEROS = ["Mujer", "Hombre"];

export const CATEGORIAS = [
  "Remeras",
  "Pantalones",
  "Vestidos",
  "Camperas y abrigos",
  "Zapatillas",
  "Accesorios",
];

// tipo_prenda equivalentes por categoría de la UI (mismo criterio de
// equivalencia que GRUPOS_COMPATIBLES en lib/matching-tiendanube.ts).
// Camperas y abrigos / Zapatillas / Accesorios todavía no tienen productos
// en el catálogo, pero quedan mapeadas para cuando se carguen.
export const CATEGORIA_TIPOS: Record<string, string[]> = {
  Remeras: ["top", "camisa"],
  Pantalones: ["pantalon", "jean", "pantalon cargo", "pantalon palazzo"],
  Vestidos: ["vestido", "vestido camisero", "vestido cruzado"],
  "Camperas y abrigos": ["campera", "abrigo", "tapado", "saco"],
  Zapatillas: ["zapatilla", "zapato"],
  Accesorios: ["accesorio"],
};

export default function CategoryPills({
  categoria,
  onCategoriaChange,
  extra,
}: {
  categoria: string | null;
  onCategoriaChange: (c: string | null) => void;
  extra?: ReactNode;
}) {
  return (
    <nav className="space-y-3 bg-beige px-6 py-5 md:px-12">
      <div className="flex gap-2.5 overflow-x-auto">
        <span className="shrink-0 whitespace-nowrap rounded-full border border-negro bg-negro px-[18px] py-2 text-[13px] text-crema">
          Todos
        </span>
        {GENEROS.map((genero) => (
          <span
            key={genero}
            className="shrink-0 whitespace-nowrap rounded-full border border-negro/25 px-[18px] py-2 text-[13px] text-negro"
          >
            {genero}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => onCategoriaChange(null)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-[18px] py-2 text-[13px] ${
              categoria === null
                ? "border-negro bg-negro text-crema"
                : "border-negro/25 text-negro hover:border-negro"
            }`}
          >
            Todo
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoriaChange(cat)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-[18px] py-2 text-[13px] ${
                categoria === cat
                  ? "border-negro bg-negro text-crema"
                  : "border-negro/25 text-negro hover:border-negro"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-negro/25 px-[18px] py-2 text-[13px] text-negro/55">
            Vintage
          </span>
        </div>
        {extra}
      </div>
    </nav>
  );
}
