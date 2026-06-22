import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { catalogo, type Producto } from "@/lib/catalogo";
import { analyzeImageFromDataUrl, type Analisis } from "@/lib/azure-openai";

export const runtime = "nodejs";

const PRODUCTOS_DIR = path.join(process.cwd(), "public", "productos");
const FORMATOS_VALIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const FALLBACK_ANALISIS: Analisis = {
  tipo: "blazer",
  color: "beige",
  estampado: "liso",
  estilo: "casual",
};

function getAvailableImageFiles(): Set<string> {
  try {
    return new Set(fs.readdirSync(PRODUCTOS_DIR));
  } catch {
    return new Set();
  }
}

function getAvailableCatalog(): Producto[] {
  const available = getAvailableImageFiles();
  return catalogo.filter((p) => {
    const fname = p.imagen.split("/").pop() ?? "";
    return available.has(fname);
  });
}

function heuristicRanking(criterios: Analisis, items: Producto[]): number[] {
  const scored = items.map((p) => {
    let score = 0;
    if (p.tipo === criterios.tipo) {
      score += 3;
      if (p.color === criterios.color) score += 2;
      if (p.estampado === criterios.estampado) score += 2;
      if (p.estilo === criterios.estilo) score += 1;
    }
    return { id: p.id, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.id);
}

function buildResponse(analisis: Analisis) {
  const items = getAvailableCatalog();
  return { ...analisis, ranked_ids: heuristicRanking(analisis, items) };
}

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

async function fetchAsBase64(url: string): Promise<string | null> {
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
      console.error(
        "[analyze-image] fetch imagen falló:",
        res.status,
        res.statusText,
        normalizada
      );
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = (res.headers.get("content-type") || "image/jpeg")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (!FORMATOS_VALIDOS.includes(contentType)) {
      console.error(
        `[analyze-image] formato no soportado: ${contentType}`
      );
      return null;
    }

    console.log(
      `[analyze-image] imagen descargada: ${buf.length} bytes, ${contentType}`
    );
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.error("[analyze-image] fetch imagen excepción:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { imageUrl } = (await req.json()) as { imageUrl?: string };
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(buildResponse(FALLBACK_ANALISIS));
    }

    console.log("[analyze-image] ──── nueva consulta ────");
    console.log("[analyze-image] URL recibida:", imageUrl);

    const dataUrl = await fetchAsBase64(imageUrl);
    if (!dataUrl) {
      console.error("[analyze-image] No se pudo descargar la imagen");
      return NextResponse.json(buildResponse(FALLBACK_ANALISIS));
    }

    const analisis = await analyzeImageFromDataUrl(dataUrl);
    console.log(
      `[analyze-image] análisis: ${analisis.tipo} · ${analisis.color} · ${analisis.estampado} · ${analisis.estilo}`
    );

    const out = buildResponse(analisis);
    console.log("[analyze-image] ranked_ids:", out.ranked_ids);
    return NextResponse.json(out);
  } catch (err) {
    console.error("[analyze-image] Error:", err);
    return NextResponse.json(buildResponse(FALLBACK_ANALISIS));
  }
}
