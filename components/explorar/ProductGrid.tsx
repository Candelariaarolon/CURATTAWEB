import Image from "next/image";
import type { ProductoTiendanube } from "@/lib/catalogo-tiendanube";
import { formatARS } from "@/lib/format";
import GuardarEnColeccionButton from "@/components/shared/GuardarEnColeccionButton";

export default function ProductGrid({ productos }: { productos: ProductoTiendanube[] }) {
  return (
    <section className="relative isolate px-6 pb-20 pt-11 md:px-12">
      <Image
        src="/textures/kateryna-hliznitsova-2NDtPNiLcD0-unsplash.jpg"
        alt=""
        fill
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,248,243,0.94),rgba(251,248,243,0.97))]" />

      <div className="mx-auto max-w-6xl">
        {productos.length === 0 ? (
          <p className="py-16 text-center text-[13px] italic text-negro/45">
            Ningún producto coincide con estos filtros.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-7 sm:grid-cols-3 md:grid-cols-4">
            {productos.map((p) => (
              <article
                key={p.id}
                className="relative rounded bg-crema shadow-[0_10px_24px_rgba(23,19,15,0.08)] transition-transform duration-200 ease-in-out hover:-translate-y-1"
              >
                <GuardarEnColeccionButton
                  producto={{
                    productoId: String(p.id),
                    nombre: p.nombre,
                    marca: p.tipo_prenda,
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
                    {p.tipo_prenda}
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
        )}
      </div>
    </section>
  );
}
