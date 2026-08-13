import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateToken, VERIFICATION_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = { email?: unknown; password?: unknown };

// TODO(rate-limit): sin infraestructura de rate limiting todavía. Este
// endpoint dispara un mail por request — limitar por IP y/o email antes de
// producción para no habilitar spam de mails de verificación.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateToken();
  const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.user.create({
    data: { email, passwordHash, verificationToken, verificationTokenExpiry },
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (err) {
    console.error("[auth/signup] no se pudo enviar el mail de verificación:", err);
    return NextResponse.json(
      {
        error:
          "Tu cuenta se creó, pero no pudimos enviarte el mail de verificación. Podés pedir que te lo reenvíen desde /login.",
      },
      { status: 502 }
    );
  }

  // 201 sin loguear: la cuenta queda emailVerified: false hasta confirmar.
  return NextResponse.json({ ok: true }, { status: 201 });
}
