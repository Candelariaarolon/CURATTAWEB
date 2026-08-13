import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TODO: cuando Tiendanube lo exija, validar la firma HMAC del webhook
// (header tipo "x-linkedstore-hmac-sha256" o equivalente) antes de procesar.

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("[webhook] store/redact recibido:", payload);
  } catch (err) {
    console.error("[webhook] store/redact: no se pudo parsear el body:", err);
  }

  // Curatta no almacena datos de la tienda ni de clientes (solo lee
  // catálogo en modo lectura), así que no hay nada que borrar.
  return NextResponse.json({ received: true });
}
