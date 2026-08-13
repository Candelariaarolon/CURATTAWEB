import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, VERIFICATION_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

type Body = { email?: unknown };

const MENSAJE_GENERICO = {
  ok: true,
  message: "Si el email existe y no está verificado, te reenviamos el mail de confirmación.",
};

// TODO(rate-limit): sin infraestructura de rate limiting todavía — limitar
// por IP y/o email antes de producción, este endpoint dispara mails.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Falta el email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Nunca revelar si el email existe o no, ni si ya estaba verificado.
  if (!user || user.emailVerified) {
    return NextResponse.json(MENSAJE_GENERICO);
  }

  const verificationToken = generateToken();
  const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationTokenExpiry },
  });

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (err) {
    console.error("[auth/resend-verification] no se pudo enviar el mail:", err);
    return NextResponse.json({ error: "No pudimos enviar el mail. Probá de nuevo en un rato." }, { status: 502 });
  }

  return NextResponse.json(MENSAJE_GENERICO);
}
