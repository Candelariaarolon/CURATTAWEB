import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getUserBoards,
  PinterestTokenMissingError,
  PinterestTokenExpiredError,
} from "@/lib/pinterest-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const boards = await getUserBoards(session.user.id);

    const token = await prisma.pinterestToken.findUnique({
      where: { userId: session.user.id },
      select: { selectedBoardIds: true },
    });
    // Null = el usuario todavía no eligió tableros (primera conexión) y hay
    // que mostrarle el selector. Un array (aunque esté vacío) significa que
    // ya pasó por el selector al menos una vez.
    const selectedBoardIds =
      token?.selectedBoardIds != null
        ? (JSON.parse(token.selectedBoardIds) as string[])
        : null;

    return NextResponse.json({ boards, selectedBoardIds });
  } catch (err) {
    if (err instanceof PinterestTokenMissingError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof PinterestTokenExpiredError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[user/boards] Error:", err);
    return NextResponse.json({ error: "Error consultando Pinterest" }, { status: 502 });
  }
}
