import { AzureOpenAI } from "openai";

export const TIPOS = [
  "blazer",
  "vestido",
  "vestido camisero",
  "vestido cruzado",
  "pantalon",
  "pantalon cargo",
  "pantalon palazzo",
  "jean",
  "jogger",
  "camisa",
  "top",
  "falda",
  "sweater",
  "cardigan",
  "abrigo",
  "zapatos",
] as const;

export const COLORES = [
  "beige",
  "negro",
  "blanco",
  "marron",
  "camel",
  "terracota",
  "verde oliva",
  "verde esmeralda",
  "verde menta",
  "azul marino",
  "azul",
  "celeste",
  "turquesa",
  "amarillo",
  "mostaza",
  "rojo",
  "bordo",
  "rosa",
  "violeta",
  "lila",
  "naranja",
  "coral",
  "gris",
  "dorado",
  "plateado",
  "multicolor",
] as const;

export const ESTAMPADOS = [
  "liso",
  "rayas",
  "lunares",
  "floral",
  "animal print",
  "cuadros",
  "tie-dye",
  "geometrico",
  "multicolor",
  "encaje",
] as const;

export const LARGOS = ["mini", "corto", "midi", "largo", "no aplica"] as const;

export const ESTILOS = [
  "casual",
  "formal",
  "streetwear",
  "boho",
  "chic",
  "minimalista",
  "oversized",
  "deportivo",
  "vintage",
] as const;

export type Tipo = (typeof TIPOS)[number];
export type Color = (typeof COLORES)[number];
export type Estampado = (typeof ESTAMPADOS)[number];
export type Largo = (typeof LARGOS)[number];
export type Estilo = (typeof ESTILOS)[number];

export type Analisis = {
  tipo: Tipo | string;
  color: Color | string;
  estampado: Estampado | string;
  largo: Largo | string;
  estilo: Estilo | string;
};

export const PROMPT_ANALISIS = `Sos un sistema de análisis de moda. Tu ÚNICO objeto de estudio es la prenda de vestir principal en la imagen. Todo lo demás es ruido que debés descartar, sin excepción.

PASO 1 — Separá mentalmente la imagen en dos grupos (esto es razonamiento interno, no una instrucción para la persona):
- "PRENDA": la pieza de ropa principal que la persona tiene puesta (o, si no hay persona, el producto de moda fotografiado). Si hay varias prendas visibles (ej. remera + pantalón + campera), elegí como PRENDA la que ocupa mayor superficie visual o está más centrada en el encuadre.
- "IGNORAR": todo lo que NO es la prenda principal — piel (cara, brazos, piernas, manos), cabello, fondo, paredes, pisos, cielo, vegetación, edificios, animales, mobiliario, iluminación/filtros de la foto, y accesorios secundarios (bolsos, carteras, joyas, cinturones, sombreros, zapatos) salvo que el accesorio sea inequívocamente el foco principal de la imagen.

Antes de responder, escribí en una sola línea de texto plano (SIN llaves { } ni comillas dobles) qué identificaste como PRENDA y qué descartaste como IGNORAR. Ejemplo de formato de esa línea: Prenda: vestido midi floral que lleva puesto. Ignorar: piel, cabello castaño, pared blanca de fondo, sandalias.

PASO 2 — Con la PRENDA ya aislada, identificá el color REAL de su tela. El color de la prenda NUNCA es el color de la piel, del cabello, del fondo o el tono dominante de la foto en su conjunto.

Ejemplos de errores que DEBÉS evitar:
- Persona de cabello rubio con prenda negra → color: "negro" (NO "amarillo", NO el color del pelo).
- Prenda blanca fotografiada contra una pared celeste o cielo azul → color: "blanco" (NO "celeste" ni "azul").
- Prenda beige sobre piel bronceada → color: "beige" (NO un tono de piel).
- Foto con filtro cálido/anaranjado que tiñe toda la imagen → identificá el color real de la tela, no el tinte del filtro.

Usá "largo" solo para prendas donde el largo es relevante (vestidos, faldas, pantalones, abrigos). Si la prenda es un accesorio o tipo de prenda donde el largo no aplica (ej. zapatos, top), usá "no aplica".

Cada campo del resultado debe ser EXACTAMENTE uno de los valores listados a continuación, sin inventar variantes:
- tipo: ${TIPOS.join(", ")}
- color: ${COLORES.join(", ")}
- estampado: ${ESTAMPADOS.join(", ")}
- largo: ${LARGOS.join(", ")}
- estilo: ${ESTILOS.join(", ")}

FORMATO DE RESPUESTA — respondé exactamente en este orden y nada más:
1. La línea de razonamiento del PASO 1 (texto plano, sin llaves ni comillas dobles).
2. En la línea siguiente, EXCLUSIVAMENTE este JSON, sin markdown, sin explicación adicional:
{ "tipo": "...", "color": "...", "estampado": "...", "largo": "...", "estilo": "..." }`;

export function createClient(): AzureOpenAI {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!apiKey || !endpoint || !apiVersion || !deployment) {
    throw new Error(
      "Faltan variables de entorno de Azure OpenAI. Revisá tu .env.local."
    );
  }

  return new AzureOpenAI({ apiKey, endpoint, apiVersion, deployment });
}

function extractJson(text: string): Partial<Analisis> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function analyzeImageFromDataUrl(
  dataUrl: string
): Promise<Analisis> {
  const client = createClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;

  const response = await client.chat.completions.create({
    model: deployment,
    max_tokens: 350,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT_ANALISIS },
          { type: "image_url", image_url: { url: dataUrl, detail: "auto" } },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  const razonamiento = text.slice(0, text.indexOf("{")).trim();
  if (razonamiento) {
    console.log(`[azure-openai] razonamiento: ${razonamiento}`);
  }
  const parsed = extractJson(text);

  if (
    !parsed ||
    !parsed.tipo ||
    !parsed.color ||
    !parsed.estampado ||
    !parsed.largo ||
    !parsed.estilo
  ) {
    throw new Error(
      `Respuesta inválida del modelo. Texto crudo:\n${text || "(vacío)"}`
    );
  }

  return {
    tipo: String(parsed.tipo).toLowerCase().trim(),
    color: String(parsed.color).toLowerCase().trim(),
    estampado: String(parsed.estampado).toLowerCase().trim(),
    largo: String(parsed.largo).toLowerCase().trim(),
    estilo: String(parsed.estilo).toLowerCase().trim(),
  };
}
