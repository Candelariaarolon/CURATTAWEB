import { NextRequest, NextResponse } from "next/server";
import { saveStoreToken } from "@/lib/tiendanube-store";

export const runtime = "nodejs";

const TOKEN_URL = "https://www.tiendanube.com/apps/authorize/token";

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  user_id?: number | string;
  error?: string;
  error_description?: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    console.error("[tiendanube/callback] falta el query param 'code'");
    return NextResponse.redirect(new URL("/tiendanube/error", req.url));
  }

  const clientId = process.env.TIENDANUBE_APP_ID;
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "[tiendanube/callback] faltan TIENDANUBE_APP_ID / TIENDANUBE_CLIENT_SECRET en el entorno"
    );
    return NextResponse.redirect(new URL("/tiendanube/error", req.url));
  }

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
      }),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => null)) as TokenResponse | null;

    if (!res.ok || !data?.access_token || !data.user_id) {
      console.error(
        "[tiendanube/callback] intercambio de code falló:",
        res.status,
        data?.error_description || data?.error || "respuesta inesperada"
      );
      return NextResponse.redirect(new URL("/tiendanube/error", req.url));
    }

    await saveStoreToken(String(data.user_id), data.access_token);
    console.log(`[tiendanube/callback] tienda ${data.user_id} conectada con éxito`);

    return NextResponse.redirect(new URL("/tiendanube/conectado", req.url));
  } catch (err) {
    console.error("[tiendanube/callback] excepción durante el intercambio:", err);
    return NextResponse.redirect(new URL("/tiendanube/error", req.url));
  }
}
