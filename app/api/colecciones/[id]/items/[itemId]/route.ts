import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const coleccion = await prisma.coleccion.findUnique({ where: { id: params.id } });
  if (!coleccion || coleccion.userId !== session.user.id) {
    return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
  }

  await prisma.coleccionItem.deleteMany({
    where: { id: params.itemId, coleccionId: params.id },
  });

  return NextResponse.json({ ok: true });
}
