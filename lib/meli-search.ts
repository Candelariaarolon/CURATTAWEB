import { getAccessToken } from "./meli-auth";

export type MeliAtributos = {
  tipo: string;
  color: string;
  estampado: string;
  largo: string;
  estilo: string;
};

export type MeliProducto = {
  id: string;
  nombre: string;
  precio: number;
  moneda: string;
  imagen: string;
  url: string;
  tipo: string;
  color: string;
  estampado: string;
  largo: string;
  estilo: string;
};

type MeliProductoCandidato = {
  id?: string;
  name?: string;
  pictures?: { url?: string }[];
};

type MeliSearchResponse = {
  results?: MeliProductoCandidato[];
};

type MeliItemGanador = {
  item_id?: string;
  price?: number;
  currency_id?: string;
};

type MeliItemsResponse = {
  results?: MeliItemGanador[];
};

// domain_discovery devuelve un array directo (no envuelto en {results: []})
type MeliDominioSugerido = {
  domain_id?: string;
};

const SEARCH_ENDPOINT = "https://api.mercadolibre.com/products/search";
const PRODUCTS_ENDPOINT = "https://api.mercadolibre.com/products";
const DOMAIN_DISCOVERY_ENDPOINT =
  "https://api.mercadolibre.com/sites/MLA/domain_discovery/search";
const SITE_ID = "MLA";

// /products/search suele devolver candidatos "de catálogo" sin ningún
// vendedor activo ahora mismo (fichas técnicas sin oferta). Empezamos
// pidiendo pocos candidatos y, si ninguno resulta comprable, ampliamos
// antes de rendirnos.
const LIMITES_CANDIDATOS = [15, 30];

function construirQuery(attrs: MeliAtributos): string {
  const partes = [attrs.tipo];
  // "no aplica" es ruido — el largo solo suma si el modelo lo pudo determinar
  if (attrs.largo && attrs.largo !== "no aplica") {
    partes.push(attrs.largo);
  }
  // "liso" es ruido en la búsqueda — un producto sin estampado no se describe así
  if (attrs.estampado && attrs.estampado !== "liso") {
    partes.push(attrs.estampado);
  }
  partes.push(attrs.color);
  if (attrs.estilo) {
    partes.push(attrs.estilo);
  }
  return partes.filter(Boolean).join(" ").trim();
}

function normalizarImagen(url: string | undefined): string {
  if (!url) return "";
  return url.replace(/^http:\/\//, "https://");
}

// El endpoint que devuelve el permalink real de una publicación (/items/{id})
// está bloqueado para esta app (403). Mercado Libre igual redirige
// correctamente la URL corta "SITIO-NUMERO" (sin el slug descriptivo) a la
// página real de la publicación, así que la construimos a mano.
function construirPermalink(itemId: string): string {
  const match = itemId.match(/^([A-Z]+)(\d+)$/);
  if (!match) return `https://articulo.mercadolibre.com.ar/${itemId}`;
  const [, sitio, numero] = match;
  return `https://articulo.mercadolibre.com.ar/${sitio}-${numero}`;
}

// /products/search sin domain_id rankea por texto libre en TODO el catálogo:
// para "vestido floral" el top 15 eran peluches, ropa de mascota y muñecas
// (todos con "vestido floral" literal en el nombre), ninguna prenda real.
// domain_discovery interpreta la query en lenguaje natural y devuelve el/los
// domain_id reales (ej. "MLA-DRESSES" para vestidos de mujer, "MLA-SNEAKERS"
// para zapatillas). Pasado como parámetro server-side a /products/search,
// SÍ acota de verdad — a diferencia de category_id, que la API ignora en
// silencio.
async function descubrirDominios(
  query: string,
  accessToken: string
): Promise<Set<string>> {
  const params = new URLSearchParams({ q: query, limit: "5" });
  try {
    const res = await fetch(`${DOMAIN_DISCOVERY_ENDPOINT}?${params.toString()}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return new Set();
    const data = (await res.json()) as MeliDominioSugerido[];
    const dominios = data
      .map((d) => d.domain_id)
      .filter((id): id is string => Boolean(id));
    return new Set(dominios);
  } catch (err) {
    console.error("[meli-search] no se pudo resolver el dominio de la query:", err);
    return new Set();
  }
}

async function buscarCandidatos(
  query: string,
  accessToken: string,
  limit: number,
  domainId: string | undefined
): Promise<MeliProductoCandidato[]> {
  const params = new URLSearchParams({
    site_id: SITE_ID,
    q: query,
    limit: String(limit),
  });
  if (domainId) {
    params.set("domain_id", domainId);
  }

  const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    console.error(
      `[meli-search] HTTP ${res.status} ${res.statusText} en /products/search para "${query}" (domain_id=${domainId ?? "-"})`
    );
    return [];
  }
  const data = (await res.json()) as MeliSearchResponse;
  return Array.isArray(data.results) ? data.results : [];
}

// /products/search devuelve fichas de catálogo (candidatos), NO garantiza
// que alguien las esté vendiendo ahora. Para saber si un producto de
// catálogo es comprable hay que consultar /products/{id}/items, que trae
// la publicación "ganadora" (precio, moneda, item_id) si existe una oferta
// activa. Si ningún vendedor la tiene publicada, este endpoint devuelve 404
// y ese candidato se descarta.
async function buscarGanador(
  productoId: string,
  accessToken: string
): Promise<MeliItemGanador | null> {
  try {
    const res = await fetch(`${PRODUCTS_ENDPOINT}/${productoId}/items`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null; // 404 típico: sin oferta activa para este producto
    const data = (await res.json()) as MeliItemsResponse;
    return data.results?.[0] ?? null;
  } catch (err) {
    console.error(`[meli-search] no se pudo resolver ganador de ${productoId}:`, err);
    return null;
  }
}

async function resolverComprable(
  candidato: MeliProductoCandidato,
  accessToken: string,
  atributos: MeliAtributos
): Promise<MeliProducto | null> {
  if (!candidato.id || !candidato.name) return null;

  const ganador = await buscarGanador(candidato.id, accessToken);
  if (!ganador || typeof ganador.price !== "number" || !ganador.item_id) {
    return null;
  }

  return {
    id: candidato.id,
    nombre: candidato.name,
    precio: ganador.price,
    moneda: ganador.currency_id ?? "ARS",
    imagen: normalizarImagen(candidato.pictures?.[0]?.url),
    url: construirPermalink(ganador.item_id),
    tipo: atributos.tipo,
    color: atributos.color,
    estampado: atributos.estampado,
    largo: atributos.largo,
    estilo: atributos.estilo,
  };
}

export async function buscarEnMeli(
  atributos: MeliAtributos
): Promise<MeliProducto[]> {
  const query = construirQuery(atributos);
  if (!query) return [];

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (err) {
    console.error("[meli-search] no se pudo obtener access_token:", err);
    return [];
  }

  console.log(`[meli-search] query: "${query}"`);

  const dominios = await descubrirDominios(query, accessToken);
  console.log(
    `[meli-search] dominios sugeridos: ${dominios.size > 0 ? [...dominios].join(", ") : "(ninguno)"}`
  );

  // Probamos primero acotado a cada dominio sugerido (mucho más relevante) y,
  // si ninguno tiene oferta comprable, caemos a la búsqueda sin restricción
  // de dominio antes de rendirnos.
  const scopes: (string | undefined)[] = [...dominios, undefined];

  for (const domainId of scopes) {
    for (const limit of LIMITES_CANDIDATOS) {
      const candidatos = await buscarCandidatos(query, accessToken, limit, domainId);
      console.log(
        `[meli-search] domain_id=${domainId ?? "(sin restricción)"} limit=${limit} → ${candidatos.length} candidatos`
      );

      const resueltos = await Promise.all(
        candidatos.map((c) => resolverComprable(c, accessToken, atributos))
      );
      const comprables = resueltos.filter((p): p is MeliProducto => p !== null);

      console.log(`[meli-search] ${comprables.length} con oferta activa`);

      if (comprables.length > 0) {
        return comprables;
      }
    }
  }

  return [];
}
