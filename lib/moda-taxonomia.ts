import { createClient, TIPOS } from "./azure-openai";

// tipo_prenda reusa la lista ya normalizada de lib/azure-openai.ts: es el
// filtro duro del matching, así que necesita ser el mismo vocabulario cerrado
// que ya viene funcionando bien para clasificación de tipo de prenda.
export const TIPOS_PRENDA = TIPOS;

export const SILUETAS_CORTE = [
  "fitted",
  "oversize",
  "recto",
  "acampanado",
  "skinny",
  "wide leg",
  "cropped",
  "wrap",
  "off-shoulder",
  "asimetrico",
] as const;

export const PATRONES = [
  "liso",
  "rayas_horizontales",
  "rayas_verticales",
  "lunares",
  "floral",
  "animal_print",
  "cuadros",
  "geometrico",
  "tie_dye",
  "encaje",
  "multicolor",
] as const;

export const FAMILIAS_COLOR = [
  "neutros_oscuros",
  "neutros_claros",
  "pasteles",
  "vivos_saturados",
  "tierra",
  "metalizados",
] as const;

export const TEXTURAS_TELA = [
  "algodon",
  "denim",
  "jersey",
  "tejido_punto",
  "lino",
  "seda_satinado",
  "cuero",
  "gasa",
  "pana",
  "lana",
] as const;

export const FORMALIDADES_ESTILO = [
  "casual",
  "urbano_desenfadado",
  "sastreria_formal",
  "elegante_noche",
  "resort_playero",
  "deportivo",
] as const;

export type TipoPrenda = (typeof TIPOS_PRENDA)[number];
export type SiluetaCorte = (typeof SILUETAS_CORTE)[number];
export type Patron = (typeof PATRONES)[number];
export type FamiliaColor = (typeof FAMILIAS_COLOR)[number];
export type TexturaTela = (typeof TEXTURAS_TELA)[number];
export type FormalidadEstilo = (typeof FORMALIDADES_ESTILO)[number];

export type AnalisisModa = {
  tipo_prenda: TipoPrenda | string;
  silueta_corte: SiluetaCorte | string;
  patron: Patron | string;
  familia_color: FamiliaColor | string;
  textura_tela: TexturaTela | string;
  formalidad_estilo: FormalidadEstilo | string;
};

// Mismo bugfix que lib/azure-openai.ts (PROMPT_ANALISIS): sin este paso
// explícito de aislar la prenda, el modelo confunde el color/textura de la
// prenda con el de la piel, el pelo o el fondo cuando hay una persona puesta.
export const PROMPT_ANALISIS_MODA = `Sos un sistema de análisis de moda. Tu ÚNICO objeto de estudio es la prenda de vestir principal en la imagen. Todo lo demás es ruido que debés descartar, sin excepción.

PASO 1 — Separá mentalmente la imagen en dos grupos (esto es razonamiento interno, no una instrucción para la persona):
- "PRENDA": la pieza de ropa principal que la persona tiene puesta (o, si no hay persona, el producto de moda fotografiado). Si hay varias prendas visibles (ej. remera + pantalón + campera), elegí como PRENDA la que ocupa mayor superficie visual o está más centrada en el encuadre.
- "IGNORAR": todo lo que NO es la prenda principal — piel (cara, brazos, piernas, manos), cabello, fondo, paredes, pisos, cielo, vegetación, edificios, animales, mobiliario, iluminación/filtros de la foto, y accesorios secundarios (bolsos, carteras, joyas, cinturones, sombreros, zapatos) salvo que el accesorio sea inequívocamente el foco principal de la imagen.

Antes de responder, escribí en una sola línea de texto plano (SIN llaves { } ni comillas dobles) qué identificaste como PRENDA y qué descartaste como IGNORAR. Ejemplo de formato de esa línea: Prenda: vestido midi floral que lleva puesto. Ignorar: piel, cabello castaño, pared blanca de fondo, sandalias.

PASO 2 — Con la PRENDA ya aislada, identificá sus atributos reales de tela y corte. Ninguno de estos atributos es nunca el de la piel, el cabello o el fondo:
- Una prenda negra sobre piel bronceada o cabello rubio sigue siendo "neutros_oscuros", no un tono de piel/pelo.
- Una prenda blanca contra una pared celeste o cielo azul sigue siendo "neutros_claros", no "pasteles" ni el color del fondo.
- Un filtro cálido/anaranjado que tiñe toda la foto no cambia la familia de color real de la tela.

Cada campo del resultado debe ser EXACTAMENTE uno de los valores listados a continuación, sin inventar variantes:
- tipo_prenda: ${TIPOS_PRENDA.join(", ")}
- silueta_corte: ${SILUETAS_CORTE.join(", ")}
- patron: ${PATRONES.join(", ")}
- familia_color: ${FAMILIAS_COLOR.join(", ")}
- textura_tela: ${TEXTURAS_TELA.join(", ")}
- formalidad_estilo: ${FORMALIDADES_ESTILO.join(", ")}

FORMATO DE RESPUESTA — respondé exactamente en este orden y nada más:
1. La línea de razonamiento del PASO 1 (texto plano, sin llaves ni comillas dobles).
2. En la línea siguiente, EXCLUSIVAMENTE este JSON, sin markdown, sin explicación adicional:
{ "tipo_prenda": "...", "silueta_corte": "...", "patron": "...", "familia_color": "...", "textura_tela": "...", "formalidad_estilo": "..." }`;

function extractJson(text: string): Partial<AnalisisModa> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function analyzeImageModaFromDataUrl(
  dataUrl: string
): Promise<AnalisisModa> {
  const client = createClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;

  const response = await client.chat.completions.create({
    model: deployment,
    max_tokens: 400,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT_ANALISIS_MODA },
          { type: "image_url", image_url: { url: dataUrl, detail: "auto" } },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  const razonamiento = text.slice(0, text.indexOf("{")).trim();
  if (razonamiento) {
    console.log(`[moda-taxonomia] razonamiento: ${razonamiento}`);
  }
  const parsed = extractJson(text);

  if (
    !parsed ||
    !parsed.tipo_prenda ||
    !parsed.silueta_corte ||
    !parsed.patron ||
    !parsed.familia_color ||
    !parsed.textura_tela ||
    !parsed.formalidad_estilo
  ) {
    throw new Error(
      `Respuesta inválida del modelo. Texto crudo:\n${text || "(vacío)"}`
    );
  }

  return {
    tipo_prenda: String(parsed.tipo_prenda).toLowerCase().trim(),
    silueta_corte: String(parsed.silueta_corte).toLowerCase().trim(),
    patron: String(parsed.patron).toLowerCase().trim(),
    familia_color: String(parsed.familia_color).toLowerCase().trim(),
    textura_tela: String(parsed.textura_tela).toLowerCase().trim(),
    formalidad_estilo: String(parsed.formalidad_estilo).toLowerCase().trim(),
  };
}
