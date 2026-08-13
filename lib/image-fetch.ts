import fs from "node:fs";
import path from "node:path";

const FORMATOS_VALIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function mimeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "image/jpeg";
  }
}

async function readLocalAsDataUrl(publicPath: string): Promise<string | null> {
  try {
    const safePath = publicPath.split("?")[0].split("#")[0];
    const decoded = decodeURIComponent(safePath);
    const fsPath = path.join(process.cwd(), "public", decoded);
    const buf = fs.readFileSync(fsPath);
    const contentType = mimeFromExt(path.extname(fsPath));
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.error("[image-fetch] lectura local falló:", err);
    return null;
  }
}

// Unsplash sirve avif/webp negociado por Accept, que a veces cae fuera de
// FORMATOS_VALIDOS. Forzar fm=jpg (y sacar auto=format) evita el 415.
function forzarFormatoJpeg(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("unsplash.com")) {
      u.searchParams.set("fm", "jpg");
      u.searchParams.delete("auto");
    }
    return u.toString();
  } catch {
    return url;
  }
}

// Descarga una imagen (URL remota, ruta local /public, o data URL ya lista)
// y la devuelve como data URL para mandarla a Azure OpenAI Vision.
export async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) return readLocalAsDataUrl(url);

  const normalizada = forzarFormatoJpeg(url);
  try {
    const res = await fetch(normalizada, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "image/jpeg,image/png,image/webp,image/gif",
      },
    });
    if (!res.ok) {
      console.error("[image-fetch] fetch imagen falló:", res.status, url);
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = (res.headers.get("content-type") || "image/jpeg")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (!FORMATOS_VALIDOS.includes(contentType)) {
      console.error(`[image-fetch] formato no soportado: ${contentType}`);
      return null;
    }

    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.error("[image-fetch] fetch imagen excepción:", err);
    return null;
  }
}
