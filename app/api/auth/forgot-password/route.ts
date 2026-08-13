import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken, RESET_TOKEN_TTL_MS } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export const runtime = "nodejs";

type Body = { email?: unknown };

const MENSAJE_GENERICO = {
  ok: true,
  message: "Si el email existe, te enviamos un link para restablecer tu contraseña.",
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

  // Nunca revelar si el email existe o no.
  if (!user) {
    return NextResponse.json(MENSAJE_GENERICO);
  }

  const resetToken = generateToken();
  const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  try {
    await sendPasswordResetEmail(email, resetToken);
  } catch (err) {
    console.error("[auth/forgot-password] no se pudo enviar el mail:", err);
    // Igual devolvemos el mensaje genérico — no confirmar ni negar nada
    // sobre el estado del envío sería filtrar que el email sí existe.
  }

  return NextResponse.json(MENSAJE_GENERICO);
}
