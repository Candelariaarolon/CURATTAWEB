import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "pinterest_oauth_state";
const RETURN_TO_COOKIE = "pinterest_oauth_return_to";
// user_accounts:read hace falta para poder identificar la cuenta de
// Pinterest en el callback (GET /v5/user_account) y así aplicar el
// constraint 1 a 1 con la cuenta de Curatta.
const SCOPES = "user_accounts:read,boards:read,pins:read";

// Solo se acepta un path relativo propio (empieza con "/", nunca "//") para
// no convertir esto en un open redirect si alguien arma el link a mano.
function returnToSeguro(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/explorar";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  const origin = new URL(req.url).origin;
  const returnTo = returnToSeguro(new URL(req.url).searchParams.get("returnTo"));

  // Safari (a diferencia de Chrome) no guarda cookies "Secure" servidas por
  // http://localhost en dev — así que el flag secure depende del protocolo
  // real de la request, no un true fijo.
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  // Guardamos desde qué página se inició la conexión para volver ahí mismo
  // después del callback, en vez de mandar siempre a una página fija.
  cookieStore.set(RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  // El redirect_uri se calcula a partir del origin de la request (no de una
  // env var fija) para que funcione sin importar el puerto/dominio del dev
  // server. Tiene que ser EXACTAMENTE el mismo valor acá y en /callback, y
  // estar registrado tal cual en el dashboard de Pinterest Developers.
  const redirectUri = `${origin}/api/auth/pinterest/callback`;

  const authorizeUrl = new URL("https://www.pinterest.com/oauth/");
  authorizeUrl.searchParams.set("client_id", process.env.PINTEREST_APP_ID!);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", SCOPES);
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl);
}
