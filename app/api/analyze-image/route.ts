import { NextResponse } from "next/server";
import { matchProductos } from "@/lib/matching-tiendanube";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { imageUrl?: string };
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({
        analisis: null,
        productos: [],
        mensaje: "No se recibió ninguna imagen para analizar",
      });
    }

    console.log("[analyze-image] ──── nueva consulta ────");
    console.log("[analyze-image] URL recibida:", imageUrl);

    const resultado = await matchProductos([imageUrl]);
    const analisis = resultado.analisis[0] ?? null;
    const productos = resultado.matches
      .flatMap((g) => g.productos)
      .sort((a, b) => b.score - a.score);

    console.log(
      "[analyze-image] análisis:",
      analisis,
      "— productos encontrados:",
      productos.length
    );

    return NextResponse.json({
      analisis,
      productos,
      mensaje: resultado.mensaje,
    });
  } catch (err) {
    console.error("[analyze-image] Error:", err);
    return NextResponse.json({
      analisis: null,
      productos: [],
      mensaje: "Ocurrió un error analizando la imagen",
    });
  }
}
