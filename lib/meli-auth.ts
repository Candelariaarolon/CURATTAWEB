// Gestor de tokens de Mercado Libre.
// Mantiene un access_token en cache en memoria con su expiración.
// Cuando expira (o no existe), lo regenera usando el refresh_token.

import fs from "node:fs";
import path from "node:path";

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

// 5 minutos de margen antes de que expire, para no usar uno casi vencido.
const EXPIRY_MARGIN_MS = 5 * 60 * 1000;

// Mercado Libre rota el refresh_token en cada uso: el que se usó para pedir
// un access_token queda invalidado y hay que usar el nuevo la próxima vez.
// No podemos escribir en .env.local en runtime, así que lo persistimos acá
// (gitignored) y lo priorizamos por sobre MELI_REFRESH_TOKEN, que solo sirve
// como semilla inicial la primera vez que se corre la app.
const TOKEN_STORE_PATH = path.join(process.cwd(), ".meli-token.json");

type CachedToken = {
  accessToken: string;
  expiresAt: number; // timestamp en ms
};

let cached: CachedToken | null = null;
let refreshInFlight: Promise<string> | null = null;

type RefreshResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  user_id?: number;
  error?: string;
  message?: string;
};

function leerRefreshTokenGuardado(): string | null {
  try {
    const raw = fs.readFileSync(TOKEN_STORE_PATH, "utf-8");
    const data = JSON.parse(raw) as { refreshToken?: string };
    return data.refreshToken || null;
  } catch {
    return null;
  }
}

function guardarRefreshToken(refreshToken: string): void {
  try {
    fs.writeFileSync(
      TOKEN_STORE_PATH,
      JSON.stringify({ refreshToken, updatedAt: new Date().toISOString() }, null, 2)
    );
    console.log("[meli-auth] refresh_token nuevo guardado en .meli-token.json");
  } catch (err) {
    console.error("[meli-auth] no se pudo guardar el refresh_token nuevo:", err);
  }
}

async function refreshAccessToken(): Promise<string> {
  const appId = process.env.MELI_CLIENT_ID;
  const secret = process.env.MELI_CLIENT_SECRET;
  const refreshToken = leerRefreshTokenGuardado() || process.env.MELI_REFRESH_TOKEN;

  if (!appId || !secret || !refreshToken) {
    throw new Error(
      "Faltan variables de Meli (MELI_CLIENT_ID, MELI_CLIENT_SECRET en .env.local, y un refresh_token en .env.local o .meli-token.json)"
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: appId,
    client_secret: secret,
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = (await res.json()) as RefreshResponse;

  if (!res.ok || !data.access_token) {
    const detail = data.message || data.error || "respuesta inesperada";
    throw new Error(`Meli refresh falló (HTTP ${res.status}): ${detail}`);
  }

  const expiresInMs = (data.expires_in ?? 21600) * 1000;
  cached = {
    accessToken: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  };

  if (data.refresh_token && data.refresh_token !== refreshToken) {
    guardarRefreshToken(data.refresh_token);
  }

  console.log(
    `[meli-auth] access_token renovado, expira en ${Math.round(expiresInMs / 1000 / 60)}min`
  );

  return data.access_token;
}

export async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - EXPIRY_MARGIN_MS) {
    return cached.accessToken;
  }
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}
