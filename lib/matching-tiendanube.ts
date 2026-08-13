import { catalogoTiendanube, type ProductoTiendanube } from "./catalogo-tiendanube";
import { analyzeImageModaFromDataUrl, type AnalisisModa } from "./moda-taxonomia";
import { fetchImageAsDataUrl } from "./image-fetch";

// textura_tela y formalidad_estilo pesan más que corte/patrón/color: son los
// atributos que más definen si dos prendas realmente "son lo mismo" en la
// práctica (ej. una musculosa deportiva de jersey vs. un top de fiesta con
// lentejuelas pueden compartir corte/patrón/color y aun así no parecerse en
// nada). Con corte+patrón+color solos (sin matchear tela ni formalidad) el
// score máximo posible queda en 50%, por debajo del umbral más estricto
// (60%) — así ya no alcanza con "mismo color y corte" para pasar.
const PESOS = {
  silueta_corte: 2,
  patron: 2,
  familia_color: 2,
  textura_tela: 3,
  formalidad_estilo: 3,
} as const;

const PESO_TOTAL = Object.values(PESOS).reduce((a, b) => a + b, 0); // 12

// tipo_prenda es el filtro duro, pero el vocabulario cerrado de TIPOS tiene
// categorías solapadas que el modelo etiqueta de forma inconsistente para la
// misma prenda real (confirmado: un jean de tela denim clasificado como
// "pantalon" en vez de "jean"). Mismo criterio que ya usa
// app/api/analyze-image/route.ts para camisa/top (ahí como bonus de score;
// acá como equivalencia de filtro, porque tipo_prenda no participa del score).
const GRUPOS_COMPATIBLES: string[][] = [
  ["jean", "pantalon", "pantalon cargo", "pantalon palazzo"],
  ["top", "camisa"],
  ["vestido", "vestido camisero", "vestido cruzado"],
];

const GRUPO_POR_TIPO = new Map<string, string[]>();
for (const grupo of GRUPOS_COMPATIBLES) {
  for (const tipo of grupo) {
    GRUPO_POR_TIPO.set(tipo, grupo);
  }
}

function tiposCompatibles(tipoPrenda: string): string[] {
  return GRUPO_POR_TIPO.get(tipoPrenda) ?? [tipoPrenda];
}

// Umbral inicial 60; se relaja a 45 y luego a 30 SOLO si no hay ningún
// resultado en el umbral más estricto. No se sigue relajando por debajo del
// primer umbral que ya trajo algo — mostrar 1 match bueno es mejor que
// completar hasta un mínimo de productos con matches débiles/irrelevantes
// (ej. iba a rellenar "ropa deportiva" con vestidos de fiesta con score 30
// solo para llegar a 3 resultados).
const UMBRALES = [60, 45, 30] as const;

export type ProductoConScore = ProductoTiendanube & { score: number };

export type GrupoMatch = {
  tipo_prenda: string;
  productos: ProductoConScore[];
};

export type MatchResult = {
  matches: GrupoMatch[];
  analisis: AnalisisModa[];
  mensaje?: string;
};

function scoreContra(producto: ProductoTiendanube, referencia: AnalisisModa): number {
  let acumulado = 0;
  if (producto.silueta_corte === referencia.silueta_corte) acumulado += PESOS.silueta_corte;
  if (producto.patron === referencia.patron) acumulado += PESOS.patron;
  if (producto.familia_color === referencia.familia_color) acumulado += PESOS.familia_color;
  if (producto.textura_tela === referencia.textura_tela) acumulado += PESOS.textura_tela;
  if (producto.formalidad_estilo === referencia.formalidad_estilo) acumulado += PESOS.formalidad_estilo;
  return (acumulado / PESO_TOTAL) * 100;
}

// Si el input tiene varias imágenes de la misma categoría (ej. un tablero
// con dos vestidos distintos), un producto es buen match si se parece a
// CUALQUIERA de esas referencias, no a todas a la vez.
function mejorScore(producto: ProductoTiendanube, referencias: AnalisisModa[]): number {
  return Math.max(...referencias.map((r) => scoreContra(producto, r)));
}

// Analizar cada imagen es una descarga + una llamada a Azure OpenAI Vision
// (~2-4s). Con el límite default de 25 pines por tablero, hacerlo secuencial
// tarda más de un minuto. Se procesa con un pool de workers acotado en vez
// de Promise.all sin límite, para no disparar 25 requests simultáneos contra
// Azure (riesgo de 429 por rate limit).
const CONCURRENCIA_ANALISIS = 5;

async function analizarInputs(inputImages: string[]): Promise<AnalisisModa[]> {
  const resultados: AnalisisModa[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < inputImages.length) {
      const url = inputImages[cursor++];
      const dataUrl = await fetchImageAsDataUrl(url);
      if (!dataUrl) {
        console.error(`[matching-tiendanube] no se pudo descargar la imagen: ${url}`);
        continue;
      }
      try {
        const analisis = await analyzeImageModaFromDataUrl(dataUrl);
        resultados.push(analisis);
      } catch (err) {
        console.error(`[matching-tiendanube] análisis falló para ${url}:`, err);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCIA_ANALISIS, inputImages.length) },
    worker
  );
  await Promise.all(workers);

  return resultados;
}

function sinMatches(analisis: AnalisisModa[] = []): MatchResult {
  return {
    matches: [],
    analisis,
    mensaje: "No encontramos prendas similares en el catálogo actual",
  };
}

export async function matchProductos(inputImages: string[]): Promise<MatchResult> {
  const analisisPorImagen = await analizarInputs(inputImages);
  if (analisisPorImagen.length === 0) return sinMatches();

  // Set de tipo_prenda presentes en el input: filtro duro, agrupa además
  // las referencias de cada categoría para el scoring de similitud.
  const referenciasPorTipo = new Map<string, AnalisisModa[]>();
  for (const a of analisisPorImagen) {
    const lista = referenciasPorTipo.get(a.tipo_prenda) ?? [];
    lista.push(a);
    referenciasPorTipo.set(a.tipo_prenda, lista);
  }

  const grupos: GrupoMatch[] = [];

  for (const [tipoPrenda, referencias] of referenciasPorTipo) {
    const equivalentes = tiposCompatibles(tipoPrenda);
    const candidatos = catalogoTiendanube.filter((p) => equivalentes.includes(p.tipo_prenda));
    const scored = candidatos.map((p) => ({ ...p, score: mejorScore(p, referencias) }));

    let seleccion: ProductoConScore[] = [];
    for (const umbral of UMBRALES) {
      seleccion = scored
        .filter((p) => p.score >= umbral)
        .sort((a, b) => b.score - a.score);
      if (seleccion.length > 0) break;
    }

    grupos.push({ tipo_prenda: tipoPrenda, productos: seleccion });
  }

  const totalProductos = grupos.reduce((acc, g) => acc + g.productos.length, 0);
  if (totalProductos === 0) return sinMatches(analisisPorImagen);

  return { matches: grupos, analisis: analisisPorImagen };
}
