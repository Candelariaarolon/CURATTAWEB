// Datos mock para la landing pública y para el flujo de producto antes de
// que existan los servicios reales de matching y tracking de precios.
// Cada punto donde iría la llamada real está marcado con TODO en los
// componentes que consumen estos generadores.

export const IMAGENES_PRODUCTOS_MOCK = [
  "/productos/clangs-suit-2688317_1920.jpg",
  "/productos/designfreek-ai-generated-8786357_1920.jpg",
  "/productos/engin_akyurt-sweatpants-5173125_1920.jpg",
  "/productos/engin_akyurt-sweatpants-5185570_1920.jpg",
  "/productos/icsilviu-woman-5679284_1920.jpg",
  "/productos/jason-leung-EtOMMg1nSR8-unsplash.jpg",
  "/productos/loft184-fashion-3555646_1920.jpg",
  "/productos/mediamodifier-7cERndkOyDw-unsplash.jpg",
  "/productos/oleg-ivanov-sg_gRhbYXhc-unsplash.jpg",
  "/productos/pexels-armagan-basaran-107016502-18848213.jpg",
  "/productos/pexels-artografix-11421438.jpg",
  "/productos/pexels-chuvasher-11790168.jpg",
  "/productos/pexels-feet-1840619_1920.jpg",
  "/productos/pexels-framesbyambro-11687577.jpg",
  "/productos/pexels-leeloothefirst-4869697.jpg",
  "/productos/pexels-magapls-2149937712-31649562.jpg",
  "/productos/pexels-miriam-alonso-7585604.jpg",
  "/productos/pexels-nkhajotia-1486058.jpg",
  "/productos/pexels-pietro-henricky-1289770821-35568704.jpg",
  "/productos/pexels-rulomx-11588266.jpg",
  "/productos/pexels-vhusko-8824538.jpg",
  "/productos/sanskrutihomes-cRpcTf0VfuE-unsplash.jpg",
  "/productos/souandresantana-t-shirt-7973394.jpg",
  "/productos/souandresantana-t-shirt-7973395.jpg",
  "/productos/stocksnap-skinny-2593347_1920.jpg",
  "/productos/sunriseforever-woman-10288088_1920.jpg",
  "/productos/tobias-tullius-Fg15LdqpWrs-unsplash.jpg",
  "/productos/tuananh-blue-9yoXrG6Er_g-unsplash.jpg",
  "/productos/tuananh-blue-j_3IlDX-6uQ-unsplash.jpg",
  "/productos/tylermike525-oxford-shoes-6078951_1920.jpg",
  "/productos/versionfrancaise-t-shirt-1710578_1920.jpg",
];

const NOMBRES_PRENDA = [
  "Blazer de lino",
  "Pantalón sastre",
  "Camisa oxford",
  "Vestido midi",
  "Mocasín de cuero",
  "Chaleco de punto",
  "Pañuelo de seda",
  "Trench clásico",
  "Cárdigan de lana",
  "Falda tableada",
  "Camisa de popelín",
  "Saco cruzado",
];

const MARCAS_MOCK = [
  "Atelier Sur",
  "Casa Lino",
  "Estudio Beige",
  "Manto",
  "Rústica",
  "Cuero & Co.",
  "Hacienda",
  "Terreno",
];

export type MockProducto = {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string;
  link: string;
};

function generarProducto(index: number): MockProducto {
  const nombre = NOMBRES_PRENDA[index % NOMBRES_PRENDA.length];
  const marca = MARCAS_MOCK[index % MARCAS_MOCK.length];
  const imagen = IMAGENES_PRODUCTOS_MOCK[index % IMAGENES_PRODUCTOS_MOCK.length];
  // Precio pseudo-variado pero determinístico (mismo index → mismo precio).
  const precio = 18000 + ((index * 3737) % 62000);

  return {
    id: `mock-${index}`,
    nombre,
    marca,
    precio,
    imagen,
    link: "#",
  };
}

// TODO: reemplazar por la llamada real al servicio de matching de productos
// (ver lib/matching-tiendanube.ts) una vez que exista un endpoint que
// devuelva coincidencias para un tablero completo en vez de una imagen sola.
export function generarProductosMock(cantidad: number, offset = 0): MockProducto[] {
  return Array.from({ length: cantidad }, (_, i) => generarProducto(offset + i));
}

export type MockTablero = {
  id: string;
  titulo: string;
  cantidad: number;
  imagenes: string[];
};

export const TABLEROS_HERO_MOCK: MockTablero[] = [
  {
    id: "tablero-hero-1",
    titulo: "Oficina, versión cómoda",
    cantidad: 24,
    imagenes: IMAGENES_PRODUCTOS_MOCK.slice(0, 4),
  },
  {
    id: "tablero-hero-2",
    titulo: "Domingo de campo",
    cantidad: 18,
    imagenes: IMAGENES_PRODUCTOS_MOCK.slice(4, 8),
  },
  {
    id: "tablero-hero-3",
    titulo: "Básicos con carácter",
    cantidad: 31,
    imagenes: IMAGENES_PRODUCTOS_MOCK.slice(8, 12),
  },
  {
    id: "tablero-hero-4",
    titulo: "Noche en casa de amigas",
    cantidad: 15,
    imagenes: IMAGENES_PRODUCTOS_MOCK.slice(12, 16),
  },
];

export type MockColeccion = {
  id: string;
  nombre: string;
  boardId?: string;
  items: MockProducto[];
};

// Ilustrativo, solo para la landing pública (visitantes sin sesión). No se
// usa una vez que el usuario está logueado: ahí las colecciones son reales.
export const COLECCIONES_LANDING_MOCK: MockColeccion[] = [
  {
    id: "coleccion-landing-1",
    nombre: "Para la vuelta a la oficina",
    items: generarProductosMock(4, 0),
  },
  {
    id: "coleccion-landing-2",
    nombre: "Fin de semana largo",
    items: generarProductosMock(4, 6),
  },
];

export const DESTACADOS_MOCK: MockProducto[] = generarProductosMock(5, 20);
