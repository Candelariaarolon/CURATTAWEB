import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getBoardPins,
  PinterestTokenMissingError,
  PinterestTokenExpiredError,
} from "@/lib/pinterest-api";
import { matchProductos } from "@/lib/matching-tiendanube";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recomendaciones "Para ti": a diferencia de /api/tablero-recomendaciones
// (un tablero elegido en el momento), acá se agregan los pines de TODOS los
// tableros que el usuario sumó a Curatta (PinterestToken.selectedBoardIds)
// y se matchean juntos contra el catálogo.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const userId = session.user.id;

  const limitParam = req.nextUrl.searchParams.get("limitPorTablero");
  const parsedLimit = limitParam ? Number(limitParam) : 25;
  const limitPorTablero = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 25;

  const token = await prisma.pinterestToken.findUnique({
    where: { userId },
    select: { selectedBoardIds: true },
  });

  if (!token) {
    return NextResponse.json(
      { error: "No hay Pinterest conectado. Completá el flujo de OAuth primero." },
      { status: 404 }
    );
  }

  if (token.selectedBoardIds == null) {
    return NextResponse.json({ needsSelection: true, matches: [] });
  }

  const selectedBoardIds = JSON.parse(token.selectedBoardIds) as string[];
  if (selectedBoardIds.length === 0) {
    return NextResponse.json({
      matches: [],
      mensaje: "Todavía no sumaste tableros a Curatta. Elegí alguno en “Mis tableros conectados”.",
    });
  }

  try {
    const pinsPorTablero = await Promise.all(
      selectedBoardIds.map((boardId) => getBoardPins(userId, boardId, limitPorTablero))
    );

    const imageUrls = pinsPorTablero
      .flat()
      .map((p) => p.image)
      .filter((img): img is string => !!img);

    if (imageUrls.length === 0) {
      return NextResponse.json({
        matches: [],
        mensaje: "Tus tableros conectados no tienen pines con imagen para analizar",
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
    console.error("[para-ti] Error:", err);
    return NextResponse.json(
      { error: "Error generando recomendaciones" },
      { status: 502 }
    );
  }
}
