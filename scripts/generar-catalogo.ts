import "dotenv/config";
import { config as dotenvConfig } from "dotenv";
import { resolve, join, extname } from "node:path";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

dotenvConfig({ path: resolve(process.cwd(), ".env.local") });

import { analyzeImageFromDataUrl, type Analisis } from "../lib/azure-openai";

const PRODUCTOS_DIR = resolve(process.cwd(), "public", "productos");
const CATALOGO_PATH = resolve(process.cwd(), "lib", "catalogo.ts");
const EXTS_VALIDAS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const DELAY_MS = 300;

const PRECIOS_POR_TIPO: Record<string, [number, number]> = {
  blazer: [80000, 150000],
  vestido: [35000, 80000],
  pantalon: [40000, 90000],
  jean: [40000, 80000],
  jogger: [30000, 60000],
  camisa: [30000, 70000],
  top: [22000, 55000],
  falda: [35000, 75000],
  sweater: [45000, 95000],
  cardigan: [55000, 110000],
  abrigo: [100000, 250000],
  zapatos: [40000, 120000],
};

type ProductoGenerado = {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  estampado: string;
  estilo: string;
  precio: number;
  imagen: string;
  link: string;
};

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function capitalizar(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generarNombre(a: Analisis): string {
  const partes: string[] = [capitalizar(a.tipo), a.color];
  if (a.estampado && a.estampado !== "liso") {
    partes.push(a.estampado);
  }
  return partes.join(" ");
}

function precioAleatorio(tipo: string): number {
  const rango = PRECIOS_POR_TIPO[tipo] ?? [40000, 80000];
  const [min, max] = rango;
  const raw = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(raw / 1000) * 1000;
}

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

function generarArchivoCatalogo(productos: ProductoGenerado[]): string {
  const lineas = productos.map((p) => {
    return `  {
    id: ${p.id},
    nombre: ${JSON.stringify(p.nombre)},
    tipo: ${JSON.stringify(p.tipo)} as Tipo,
    color: ${JSON.stringify(p.color)} as Color,
    estampado: ${JSON.stringify(p.estampado)} as Estampado,
    estilo: ${JSON.stringify(p.estilo)} as Estilo,
    precio: ${p.precio},
    imagen: ${JSON.stringify(p.imagen)},
    link: ${JSON.stringify(p.link)},
  },`;
  });

  return `// ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/generar-catalogo.ts
// Para regenerar: npm run generar-catalogo
// No editar manualmente — los cambios se sobreescriben al regenerar.

import type { Tipo, Color, Estampado, Estilo } from "./azure-openai";
export type { Tipo, Color, Estampado, Estilo };

export interface Producto {
  id: number;
  nombre: string;
  tipo: Tipo;
  color: Color;
  estampado: Estampado;
  estilo: Estilo;
  precio: number;
  imagen: string;
  link: string;
}

export const catalogo: Producto[] = [
${lineas.join("\n")}
];
`;
}

async function main() {
  console.log("──────────────────────────────────────────────");
  console.log(" Curatta — generador de catálogo desde fotos");
  console.log("──────────────────────────────────────────────\n");

  if (!process.env.AZURE_OPENAI_API_KEY) {
    console.error(
      "✗ No encontré AZURE_OPENAI_API_KEY. Verificá que .env.local exista y tenga las 4 variables de Azure."
    );
    process.exit(1);
  }

  let archivos: string[];
  try {
    archivos = readdirSync(PRODUCTOS_DIR);
  } catch {
    console.error(`✗ No pude leer ${PRODUCTOS_DIR}. ¿Existe la carpeta?`);
    process.exit(1);
  }

  const imagenes = archivos
    .filter((f) => EXTS_VALIDAS.has(extname(f).toLowerCase()))
    .sort();

  if (imagenes.length === 0) {
    console.error(`✗ No hay imágenes válidas en ${PRODUCTOS_DIR}.`);
    process.exit(1);
  }

  console.log(`Encontradas ${imagenes.length} imágenes en /public/productos/\n`);

  const productos: ProductoGenerado[] = [];
  const errores: { archivo: string; error: string }[] = [];

  for (let i = 0; i < imagenes.length; i++) {
    const archivo = imagenes[i];
    const ruta = join(PRODUCTOS_DIR, archivo);
    const mime = mimeFromExt(extname(archivo));
    const etiqueta = `[${String(i + 1).padStart(2, "0")}/${imagenes.length}]`;

    process.stdout.write(`${etiqueta} ${archivo} … `);

    try {
      const buf = readFileSync(ruta);
      const dataUrl = `data:${mime};base64,${buf.toString("base64")}`;

      const analisis = await analyzeImageFromDataUrl(dataUrl);
      const producto: ProductoGenerado = {
        id: productos.length + 1,
        nombre: generarNombre(analisis),
        tipo: String(analisis.tipo),
        color: String(analisis.color),
        estampado: String(analisis.estampado),
        estilo: String(analisis.estilo),
        precio: precioAleatorio(String(analisis.tipo)),
        imagen: `/productos/${archivo}`,
        link: "https://mercadolibre.com.ar",
      };
      productos.push(producto);
      console.log(
        `✓ ${producto.nombre.padEnd(35)} [${producto.tipo}/${producto.color}/${producto.estampado}/${producto.estilo}] $${producto.precio.toLocaleString("es-AR")}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`✗ FALLÓ`);
      console.log(`     └─ ${msg.split("\n")[0]}`);
      errores.push({ archivo, error: msg });
    }

    if (i < imagenes.length - 1) {
      await delay(DELAY_MS);
    }
  }

  writeFileSync(CATALOGO_PATH, generarArchivoCatalogo(productos));

  console.log("\n──────────────────────────────────────────────");
  console.log(" Resumen");
  console.log("──────────────────────────────────────────────");
  console.log(`✓ Procesadas con éxito: ${productos.length}`);
  console.log(`✗ Fallaron:             ${errores.length}`);
  console.log(`→ Escrito en:           lib/catalogo.ts`);

  if (productos.length > 0) {
    const porTipo: Record<string, number> = {};
    for (const p of productos) {
      porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    }
    console.log("\nProductos por tipo:");
    for (const [tipo, count] of Object.entries(porTipo).sort()) {
      console.log(`  ${tipo.padEnd(12)} ${count}`);
    }
  }

  if (errores.length > 0) {
    console.log("\nErrores:");
    for (const e of errores) {
      console.log(`  • ${e.archivo}: ${e.error.split("\n")[0]}`);
    }
  }
  console.log();
}

main().catch((err) => {
  console.error("\n✗ Error fatal:", err);
  process.exit(1);
});
