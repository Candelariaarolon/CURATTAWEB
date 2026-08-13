import { NextResponse } from "next/server";
import { matchProductos } from "@/lib/matching-tiendanube";

export const runtime = "nodejs";

type Body = { imageUrls?: unknown };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { imageUrls } = body;

    if (
      !Array.isArray(imageUrls) ||
      imageUrls.length === 0 ||
      !imageUrls.every((u) => typeof u === "string")
    ) {
      return NextResponse.json(
        {
          error: "Se espera { imageUrls: string[] } con al menos una URL",
          matches: [],
        },
        { status: 400 }
      );
    }

    console.log("[recomendaciones] imágenes recibidas:", imageUrls.length);

    const resultado = await matchProductos(imageUrls as string[]);

    console.log(
      "[recomendaciones] grupos:",
      resultado.matches.map((g) => `${g.tipo_prenda}(${g.productos.length})`).join(", ") || "(ninguno)"
    );

    return NextResponse.json(resultado);
  } catch (err) {
    console.error("[recomendaciones] Error:", err);
    return NextResponse.json(
      { error: "Error al generar recomendaciones", matches: [] },
      { status: 500 }
    );
  }
}
