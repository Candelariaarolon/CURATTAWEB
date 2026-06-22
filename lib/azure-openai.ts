import { AzureOpenAI } from "openai";

export const TIPOS = [
  "blazer",
  "vestido",
  "pantalon",
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
  "verde oliva",
  "camel",
  "amarillo",
  "rojo",
  "azul",
  "gris",
  "rosa",
  "mostaza",
  "naranja",
] as const;

export const ESTAMPADOS = [
  "liso",
  "rayas",
  "cuadros",
  "floral",
  "animal print",
  "geometrico",
] as const;

export const ESTILOS = ["formal", "casual", "streetwear", "boho"] as const;

export type Tipo = (typeof TIPOS)[number];
export type Color = (typeof COLORES)[number];
export type Estampado = (typeof ESTAMPADOS)[number];
export type Estilo = (typeof ESTILOS)[number];

export type Analisis = {
  tipo: Tipo | string;
  color: Color | string;
  estampado: Estampado | string;
  estilo: Estilo | string;
};

export const PROMPT_ANALISIS = `Analizá ÚNICAMENTE la prenda de ropa principal que la persona está usando en esta imagen. IGNORÁ completamente: el fondo, el paisaje, edificios, animales, el color de pelo o piel de la persona, accesorios secundarios como bolsos o carteras (a menos que el bolso/cartera sea claramente el foco principal de la imagen), y cualquier otro elemento que no sea la prenda de vestir principal (la pieza de ropa más grande y visible: abrigo, vestido, blazer, etc.).

Identificá el color REAL de la tela de la prenda, no el color de la imagen en su conjunto ni el color dominante de la escena.

Devolvé EXCLUSIVAMENTE este JSON, sin texto adicional, sin markdown:
{ "tipo": "uno de: ${TIPOS.join(", ")}", "color": "uno de: ${COLORES.join(", ")}", "estampado": "uno de: ${ESTAMPADOS.join(", ")}", "estilo": "uno de: ${ESTILOS.join(", ")}" }`;

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
    max_tokens: 150,
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
  const parsed = extractJson(text);

  if (
    !parsed ||
    !parsed.tipo ||
    !parsed.color ||
    !parsed.estampado ||
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
    estilo: String(parsed.estilo).toLowerCase().trim(),
  };
}
