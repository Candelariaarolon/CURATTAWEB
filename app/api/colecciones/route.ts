import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const colecciones = await prisma.coleccion.findMany({
    where: { userId: session.user.id },
    include: { items: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ colecciones });
}

type Body = { nombre?: unknown };

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  if (!nombre) {
    return NextResponse.json({ error: "Falta el nombre de la colección" }, { status: 400 });
  }

  const coleccion = await prisma.coleccion.create({
    data: { userId: session.user.id, nombre },
    include: { items: true },
  });

  return NextResponse.json({ coleccion });
}
