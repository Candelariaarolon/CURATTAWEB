import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { boardIds?: unknown } | null;
  if (!body || !Array.isArray(body.boardIds) || !body.boardIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "boardIds inválido" }, { status: 400 });
  }

  const token = await prisma.pinterestToken.findUnique({
    where: { userId: session.user.id },
  });
  if (!token) {
    return NextResponse.json({ error: "Pinterest no conectado" }, { status: 404 });
  }

  await prisma.pinterestToken.update({
    where: { userId: session.user.id },
    data: { selectedBoardIds: JSON.stringify(body.boardIds) },
  });

  return NextResponse.json({ ok: true });
}
