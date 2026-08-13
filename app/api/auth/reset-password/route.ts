import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export const runtime = "nodejs";

type Body = { token?: unknown; password?: unknown };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) {
    return NextResponse.json({ error: "Falta el token" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });
  if (!user || !user.resetTokenExpiry) {
    return NextResponse.json({ error: "Link inválido o ya usado" }, { status: 400 });
  }
  if (user.resetTokenExpiry.getTime() < Date.now()) {
    return NextResponse.json({ error: "El link expiró, pedí uno nuevo" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return NextResponse.json({ ok: true });
}
