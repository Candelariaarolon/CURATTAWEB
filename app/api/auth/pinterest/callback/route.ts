import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "pinterest_oauth_state";
const RETURN_TO_COOKIE = "pinterest_oauth_return_to";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

type UserAccountResponse = {
  username?: string;
};

// Identifica la cuenta de Pinterest en sí (no la de Curatta) para poder
// aplicar el constraint 1 a 1: username es estable y único por cuenta de
// Pinterest, requiere el scope user_accounts:read.
async function getPinterestUsername(accessToken: string): Promise<string | null> {
  const res = await fetch("https://api.pinterest.com/v5/user_account", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as UserAccountResponse;
  return data.username ?? null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  const returnTo = cookieStore.get(RETURN_TO_COOKIE)?.value ?? "/explorar";
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(RETURN_TO_COOKIE);

  const errorParam = req.nextUrl.searchParams.get("error");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (errorParam || !code || !state || !savedState || state !== savedState) {
    console.error("[pinterest-callback] Validación de state falló:", {
      errorParam,
      hasCode: !!code,
      hasState: !!state,
      hasSavedState: !!savedState,
      match: state === savedState,
    });
    return NextResponse.redirect(new URL(`${returnTo}?pinterest=error`, req.url));
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/pinterest/callback`;
  const basicAuth = Buffer.from(
    `${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`
  ).toString("base64");

  try {
    const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      console.error("[pinterest-callback] OAuth exchange failed:", await res.text());
      return NextResponse.redirect(new URL(`${returnTo}?pinterest=error`, req.url));
    }

    const data = (await res.json()) as TokenResponse;
    if (!data.access_token || !data.expires_in) {
      return NextResponse.redirect(new URL(`${returnTo}?pinterest=error`, req.url));
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    const pinterestUserId = await getPinterestUsername(data.access_token);

    // Constraint de negocio: una cuenta de Pinterest solo puede estar
    // vinculada a una cuenta de Curatta. Si ese username ya está tomado por
    // OTRO usuario, rechazamos sin pisar el vínculo existente.
    if (pinterestUserId) {
      const existente = await prisma.pinterestToken.findUnique({
        where: { pinterestUserId },
      });
      if (existente && existente.userId !== session.user.id) {
        console.error(
          `[pinterest-callback] @${pinterestUserId} ya está vinculada a otra cuenta de Curatta`
        );
        return NextResponse.redirect(
          new URL(`${returnTo}?pinterest=already-linked`, req.url)
        );
      }
    }

    await prisma.pinterestToken.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        pinterestUserId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope,
        expiresAt,
      },
      update: {
        pinterestUserId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope,
        expiresAt,
      },
    });

    return NextResponse.redirect(new URL(`${returnTo}?pinterest=connected`, req.url));
  } catch (err) {
    console.error("[pinterest-callback] Error inesperado:", err);
    return NextResponse.redirect(new URL(`${returnTo}?pinterest=error`, req.url));
  }
}
