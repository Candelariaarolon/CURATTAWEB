import { NextResponse } from "next/server";
import { buscarEnMeli, type MeliAtributos } from "@/lib/meli-search";

export const runtime = "nodejs";

type Body = {
  atributos?: Partial<MeliAtributos>;
};

function validarAtributos(
  attrs: Partial<MeliAtributos> | undefined
): MeliAtributos | null {
  if (!attrs) return null;
  const { tipo, color, estampado, largo, estilo } = attrs;
  if (
    typeof tipo !== "string" ||
    typeof color !== "string" ||
    typeof estampado !== "string" ||
    typeof largo !== "string" ||
    typeof estilo !== "string"
  ) {
    return null;
  }
  return { tipo, color, estampado, largo, estilo };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const atributos = validarAtributos(body.atributos);

    if (!atributos) {
      return NextResponse.json(
        {
          error:
            "Faltan atributos. Esperado: { atributos: { tipo, color, estampado, largo, estilo } }",
          resultados: [],
        },
        { status: 400 }
      );
    }

    const resultados = await buscarEnMeli(atributos);
    return NextResponse.json({ resultados });
  } catch (err) {
    console.error("[search-meli] Error:", err);
    return NextResponse.json({ resultados: [] }, { status: 500 });
  }
}
