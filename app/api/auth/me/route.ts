import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

// No estaba en el prompt original, pero hace falta: la cookie de sesión es
// httpOnly (no la puede leer JS), así que el cliente necesita algún
// endpoint para hidratar el estado de sesión (equivalente al que exponía
// next-auth's SessionProvider por detrás).
export async function GET() {
  const session = await auth();
  return NextResponse.json({ user: session?.user ?? null });
}
