// Endpoint de un solo uso: lo visita Mercado Libre con ?code=XXX después de
// que autorices la app desde tu browser. Intercambia el code por tokens y
// muestra el refresh_token en HTML para que lo copies a .env.local.
//
// USO:
// 1. Asegurate de tener MELI_CLIENT_ID, MELI_CLIENT_SECRET y MELI_REDIRECT_URI en .env.local.
// 2. Configurá el Redirect URI en developers.mercadolibre.com.ar como el valor
//    exacto de MELI_REDIRECT_URI (debe terminar en /api/meli/callback).
// 3. Abrí en tu browser:
//    https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=TU_MELI_CLIENT_ID&redirect_uri=TU_MELI_REDIRECT_URI
// 4. Autorizá → te redirige acá → vas a ver el refresh_token en pantalla.
// 5. Pegalo en .env.local como MELI_REFRESH_TOKEN=... y reiniciá el dev server.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user_id?: number;
  scope?: string;
  error?: string;
  message?: string;
};

function htmlPage(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Curatta · Setup de Mercado Libre</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background: #F5F1EA; color: #1C1C1A; max-width: 720px; margin: 4rem auto; padding: 2rem; line-height: 1.6; }
    h1 { font-family: Georgia, serif; font-weight: 400; }
    code, pre { background: #E8E2D6; padding: 0.5rem 0.75rem; border-radius: 2px; font-size: 0.9rem; word-break: break-all; display: block; white-space: pre-wrap; }
    .ok { color: #2d5016; }
    .err { color: #7a1f1f; }
  </style>
</head>
<body>${body}</body>
</html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return htmlPage(
      `<h1 class="err">✗ Error desde Mercado Libre</h1>
       <p>ML respondió con: <code>${errorParam}</code></p>
       <p>Volvé a intentar el flujo de autorización.</p>`,
      400
    );
  }

  if (!code) {
    return htmlPage(
      `<h1>Setup de Mercado Libre</h1>
       <p>Este endpoint espera recibir un <code>?code=...</code> de Mercado Libre después de autorizar la app.</p>
       <p>Para arrancar el flujo, abrí esta URL en el browser (reemplazá <code>TU_MELI_CLIENT_ID</code> y <code>TU_MELI_REDIRECT_URI</code> por los valores reales de tu .env.local):</p>
       <pre>https://auth.mercadolibre.com.ar/authorization?response_type=code&amp;client_id=TU_MELI_CLIENT_ID&amp;redirect_uri=TU_MELI_REDIRECT_URI</pre>`,
      200
    );
  }

  const appId = process.env.MELI_CLIENT_ID;
  const secret = process.env.MELI_CLIENT_SECRET;
  const redirectUri = process.env.MELI_REDIRECT_URI;

  if (!appId || !secret || !redirectUri) {
    return htmlPage(
      `<h1 class="err">✗ Faltan credenciales</h1>
       <p>Definí <code>MELI_CLIENT_ID</code>, <code>MELI_CLIENT_SECRET</code> y <code>MELI_REDIRECT_URI</code> en tu <code>.env.local</code> y reiniciá el dev server antes de seguir.</p>`,
      500
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: appId,
    client_secret: secret,
    code,
    redirect_uri: redirectUri,
  });

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as TokenResponse;

    if (!res.ok) {
      const detalle = data.message || data.error || JSON.stringify(data);
      return htmlPage(
        `<h1 class="err">✗ ML rechazó el intercambio</h1>
         <p>HTTP ${res.status}</p>
         <pre>${detalle}</pre>
         <p>Verificá que el Redirect URI en developers.mercadolibre.com.ar sea exactamente <code>${redirectUri}</code>.</p>`,
        res.status
      );
    }

    if (!data.refresh_token) {
      return htmlPage(
        `<h1 class="err">✗ ML no devolvió un refresh_token</h1>
         <p>El intercambio fue exitoso (HTTP ${res.status}) y sí recibiste un <code>access_token</code> válido por ${data.expires_in ?? "?"}s, pero la respuesta no incluyó <code>refresh_token</code>. El Redirect URI estaba bien — el problema es otro.</p>
         <p>Esto suele pasar cuando la aplicación en developers.mercadolibre.com.ar no tiene habilitado el acceso offline. Revisá la configuración de tu app ahí (buscá una opción de tipo "Offline Access" / "Refresh Token") y volvé a intentar el flujo de autorización.</p>
         <pre>access_token: ${data.access_token?.slice(0, 12)}…
scope: ${data.scope ?? "n/d"}</pre>`,
        200
      );
    }

    return htmlPage(
      `<h1 class="ok">✓ Autorización exitosa</h1>
       <p>Pegá esta línea en tu <code>.env.local</code> (al final del archivo):</p>
       <pre>MELI_REFRESH_TOKEN=${data.refresh_token}</pre>
       <p>Después <strong>reiniciá el dev server</strong> (Ctrl+C y <code>npm run dev</code>) para que la app vea la nueva variable.</p>
       <hr/>
       <p><small>Datos adicionales (no hace falta guardarlos):</small></p>
       <ul>
         <li><small>access_token: ${data.access_token?.slice(0, 12)}… (expira en ${data.expires_in}s)</small></li>
         <li><small>user_id: ${data.user_id ?? "n/d"}</small></li>
         <li><small>scope: ${data.scope ?? "n/d"}</small></li>
       </ul>`
    );
  } catch (err) {
    return htmlPage(
      `<h1 class="err">✗ Error inesperado</h1>
       <pre>${err instanceof Error ? err.message : String(err)}</pre>`,
      500
    );
  }
}
