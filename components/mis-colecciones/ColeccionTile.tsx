import type { Coleccion } from "@/components/shared/ColeccionesProvider";

export default function ColeccionTile({
  coleccion,
  seleccionada,
  onClick,
}: {
  coleccion: Coleccion;
  seleccionada: boolean;
  onClick: () => void;
}) {
  const preview = coleccion.items.slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col overflow-hidden rounded bg-crema text-left shadow-[0_10px_24px_rgba(23,19,15,0.08)] transition-all duration-200 ease-in-out hover:-translate-y-1 ${
        seleccionada ? "ring-2 ring-negro" : ""
      }`}
    >
      <div className="grid aspect-square grid-cols-2 gap-0.5 bg-negro/5">
        {preview.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center text-[11px] italic text-negro/35">
            Vacía
          </div>
        ) : (
          Array.from({ length: 4 }, (_, i) => preview[i]).map((item, i) =>
            item ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                src={item.imagen}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div key={i} className="bg-beige/40" />
            )
          )
        )}
      </div>
      <div className="px-4 py-3.5">
        <p className="mb-0.5 text-[14px] text-negro">{coleccion.nombre}</p>
        <p className="text-[11px] uppercase tracking-[0.5px] text-negro/45">
          {coleccion.items.length} {coleccion.items.length === 1 ? "item" : "items"}
        </p>
      </div>
    </button>
  );
}
