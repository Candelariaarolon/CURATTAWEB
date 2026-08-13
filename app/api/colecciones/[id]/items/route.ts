import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  productoId?: unknown;
  nombre?: unknown;
  marca?: unknown;
  precio?: unknown;
  imagen?: unknown;
  link?: unknown;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const coleccion = await prisma.coleccion.findUnique({ where: { id: params.id } });
  if (!coleccion || coleccion.userId !== session.user.id) {
    return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (
    !body ||
    typeof body.productoId !== "string" ||
    typeof body.nombre !== "string" ||
    typeof body.marca !== "string" ||
    typeof body.precio !== "number" ||
    typeof body.imagen !== "string" ||
    typeof body.link !== "string"
  ) {
    return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  }

  const item = await prisma.coleccionItem.upsert({
    where: {
      coleccionId_productoId: { coleccionId: params.id, productoId: body.productoId },
    },
    create: {
      coleccionId: params.id,
      productoId: body.productoId,
      nombre: body.nombre,
      marca: body.marca,
      precio: body.precio,
      imagen: body.imagen,
      link: body.link,
    },
    update: {},
  });

  return NextResponse.json({ item });
}
