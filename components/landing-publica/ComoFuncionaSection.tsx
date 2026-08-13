import Image from "next/image";

const BOARD_TILES = [
  "/productos/tablero-1.jpg",
  "/productos/tablero-2.jpg",
  "/productos/tablero-3.jpg",
  "/productos/tablero-4.jpg",
];

const PRODUCTOS = [
  {
    imagen: "/productos/pantalon-camel.jpg",
    nombre: "Pantalón Sastrero “Para Atar” Loli Camel",
    precio: "$40.000",
  },
  {
    imagen: "/productos/body-encaje-chocolate.jpg",
    nombre: "Body Con Encaje América Latina Chocolate",
    precio: "$40.000",
  },
  {
    imagen: "/productos/pantalon-negro.jpg",
    nombre: "Pantalón Sastrero Con Cinturón Cutie, Pie. Negro",
    precio: "$65.000",
  },
];

export default function ComoFuncionaSection() {
  return (
    <section className="relative isolate px-6 py-24 md:px-12 md:py-32">
      <Image
        src="/textures/kateryna-hliznitsova-2NDtPNiLcD0-unsplash.jpg"
        alt=""
        fill
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,15,11,0.8)_0%,rgba(20,15,11,0.68)_100%)]" />

      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-beige">
          Cómo funciona
        </p>
        <h3 className="mb-14 font-serif text-3xl text-blanco md:text-[34px]">
          De tu tablero, a opciones reales
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-9">
          <div className="grid w-[168px] flex-none grid-cols-2 gap-1.5">
            {BOARD_TILES.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className="font-serif text-3xl italic text-beige">&#8594;</div>

          <div className="flex flex-wrap justify-center gap-4">
            {PRODUCTOS.map((p) => (
              <div
                key={p.imagen}
                className="w-[120px] overflow-hidden rounded bg-crema text-left shadow-[0_14px_30px_rgba(0,0,0,0.3)]"
              >
                <div className="relative aspect-[3/4]">
                  <Image src={p.imagen} alt="" fill className="object-cover" />
                </div>
                <div className="px-3 pb-3 pt-2.5">
                  <p className="mb-1 line-clamp-2 text-[10px] leading-tight text-negro/70">
                    {p.nombre}
                  </p>
                  <p className="text-[12.5px] font-semibold text-negro">{p.precio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-11 text-[13.5px] tracking-[0.3px] text-crema/75">
          Prendas disponibles hoy, en tiendas argentinas — listas para comprar.
        </p>
      </div>
    </section>
  );
}
