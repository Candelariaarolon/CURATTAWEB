import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

type Body = { email?: unknown; password?: unknown };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Todavía no confirmaste tu email", needsVerification: true },
      { status: 403 }
    );
  }

  await setSessionCookie({ userId: user.id, email: user.email });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
}
