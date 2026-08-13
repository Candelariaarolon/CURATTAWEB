import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getBoardPins,
  PinterestTokenMissingError,
  PinterestTokenExpiredError,
} from "@/lib/pinterest-api";
import { matchProductos } from "@/lib/matching-tiendanube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Endpoint que se llama cuando el usuario elige "conectar este tablero":
// trae los pines del tablero elegido (misma función que ya usa
// /api/user/boards/[boardId]/pins) y pasa las imágenes al matching de
// Tiendanube (Parte B) para devolver el surtido recomendado.
export async function GET(
  req: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : 25;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 25;

  try {
    const pins = await getBoardPins(session.user.id, params.boardId, limit);
    const imageUrls = pins
      .map((p) => p.image)
      .filter((img): img is string => !!img);

    if (imageUrls.length === 0) {
      return NextResponse.json({
        matches: [],
        mensaje: "Este tablero no tiene pines con imagen para analizar",
      });
    }

    const resultado = await matchProductos(imageUrls);
    return NextResponse.json(resultado);
  } catch (err) {
    if (err instanceof PinterestTokenMissingError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof PinterestTokenExpiredError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[tablero-recomendaciones] Error:", err);
    return NextResponse.json(
      { error: "Error generando recomendaciones del tablero" },
      { status: 502 }
    );
  }
}
