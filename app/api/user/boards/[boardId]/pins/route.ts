import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getBoardPins,
  PinterestTokenMissingError,
  PinterestTokenExpiredError,
} from "@/lib/pinterest-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    return NextResponse.json({ pins });
  } catch (err) {
    if (err instanceof PinterestTokenMissingError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof PinterestTokenExpiredError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[user/boards/pins] Error:", err);
    return NextResponse.json({ error: "Error consultando Pinterest" }, { status: 502 });
  }
}
