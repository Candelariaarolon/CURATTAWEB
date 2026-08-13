import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET porque el link vive en el mail (no hay JS del lado del mail). Procesa
// el token y redirige a /verificar-email con el estado resultante — esa
// página es la que muestra éxito/expirado/inválido y, si expiró, el botón
// de reenvío.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/verificar-email?status=invalid`);
  }

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user || !user.verificationTokenExpiry) {
    return NextResponse.redirect(`${appUrl}/verificar-email?status=invalid`);
  }

  if (user.verificationTokenExpiry.getTime() < Date.now()) {
    return NextResponse.redirect(
      `${appUrl}/verificar-email?status=expired&email=${encodeURIComponent(user.email)}`
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null, verificationTokenExpiry: null },
  });

  return NextResponse.redirect(`${appUrl}/verificar-email?status=success`);
}
