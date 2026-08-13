import "dotenv/config";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

dotenvConfig({ path: resolve(process.cwd(), ".env.local") });

import { prisma } from "../lib/prisma";
import { getProductos } from "../lib/tiendanube";
import { analyzeImageModaFromDataUrl } from "../lib/moda-taxonomia";
import { fetchImageAsDataUrl } from "../lib/image-fetch";

const CATALOGO_PATH = resolve(process.cwd(), "lib", "catalogo-tiendanube.ts");
const DELAY_MS = 300;

type ProductoTiendanubeAPI = {
  id: number;
  name?: { es?: string | null };
  canonical_url?: string | null;
  variants?: { price?: string | null }[];
  images?: { src: string }[];
};

type ProductoGenerado = {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  link: string;
  tipo_prenda: string;
  silueta_corte: string;
  patron: string;
  familia_color: string;
  textura_tela: string;
  formalidad_estilo: string;
};

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// "Con precio cargado" = al menos una variante con precio numérico > 0.
// Los productos de prueba sin precio (ej. cargados a medio terminar) se
// excluyen del catálogo en vez de aparecer con precio 0 o nulo.
function precioProducto(p: ProductoTiendanubeAPI): number | null {
  for (const v of p.variants ?? []) {
    if (!v.price) continue;
    const n = parseFloat(v.price);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return null;
}

function generarArchivoCatalogo(productos: ProductoGenerado[]): string {
  const lineas = productos.map(
    (p) => `  {
    id: ${p.id},
    nombre: ${JSON.stringify(p.nombre)},
    precio: ${p.precio},
    imagen: ${JSON.stringify(p.imagen)},
    link: ${JSON.stringify(p.link)},
    tipo_prenda: ${JSON.stringify(p.tipo_prenda)},
    silueta_corte: ${JSON.stringify(p.silueta_corte)},
    patron: ${JSON.stringify(p.patron)},
    familia_color: ${JSON.stringify(p.familia_color)},
    textura_tela: ${JSON.stringify(p.textura_tela)},
    formalidad_estilo: ${JSON.stringify(p.formalidad_estilo)},
  },`
  );

  return `// ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/generar-catalogo-tiendanube.ts
// Para regenerar: npm run generar-catalogo-tiendanube
// No editar manualmente — los cambios se sobreescriben al regenerar.

export interface ProductoTiendanube {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  link: string;
  tipo_prenda: string;
  silueta_corte: string;
  patron: string;
  familia_color: string;
  textura_tela: string;
  formalidad_estilo: string;
}

export const catalogoTiendanube: ProductoTiendanube[] = [
${lineas.join("\n")}
];
`;
}

async function main() {
  console.log("──────────────────────────────────────────────");
  console.log(" Curatta — catálogo Tiendanube con taxonomía de moda");
  console.log("──────────────────────────────────────────────\n");

  if (!process.env.AZURE_OPENAI_API_KEY) {
    console.error(
      "✗ No encontré AZURE_OPENAI_API_KEY. Verificá que .env.local tenga las 4 variables de Azure."
    );
    process.exit(1);
  }

  // Todas las tiendas que en algún momento conectaron su cuenta de
  // Tiendanube a Curatta (flujo OAuth en app/api/tiendanube/callback), no
  // una sola tienda fija — así Explorar mezcla el catálogo de todas.
  const tiendas = await prisma.tiendanubeToken.findMany();
  if (tiendas.length === 0) {
    console.error(
      "✗ No hay ninguna tienda conectada a Curatta todavía (tabla TiendanubeToken vacía)."
    );
    process.exit(1);
  }
  console.log(`Tiendas conectadas: ${tiendas.length} (${tiendas.map((t) => t.storeId).join(", ")})\n`);

  const productosRaw: ProductoTiendanubeAPI[] = [];
  for (const tienda of tiendas) {
    try {
      const deEstaTienda = (await getProductos(tienda.storeId)) as ProductoTiendanubeAPI[];
      console.log(`  Tienda ${tienda.storeId}: ${deEstaTienda.length} productos`);
      productosRaw.push(...deEstaTienda);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Tienda ${tienda.storeId} falló: ${msg}`);
    }
  }

  const conPrecio = productosRaw
    .map((p) => ({ p, precio: precioProducto(p) }))
    .filter(
      (x): x is { p: ProductoTiendanubeAPI; precio: number } => x.precio !== null
    );

  console.log(`\nProductos totales en Tiendanube: ${productosRaw.length}`);
  console.log(
    `Con precio cargado: ${conPrecio.length} (se excluyen ${
      productosRaw.length - conPrecio.length
    } sin precio)\n`
  );

  const productos: ProductoGenerado[] = [];
  const errores: { id: number; nombre: string; error: string }[] = [];

  for (let i = 0; i < conPrecio.length; i++) {
    const { p, precio } = conPrecio[i];
    const nombre = p.name?.es ?? `Producto ${p.id}`;
    const imagen = p.images?.[0]?.src;
    const etiqueta = `[${String(i + 1).padStart(2, "0")}/${conPrecio.length}]`;

    process.stdout.write(`${etiqueta} ${nombre} … `);

    if (!imagen) {
      console.log("✗ sin imagen, se omite");
      errores.push({ id: p.id, nombre, error: "sin imagen" });
      continue;
    }

    try {
      const dataUrl = await fetchImageAsDataUrl(imagen);
      if (!dataUrl) throw new Error("no se pudo descargar la imagen");

      const analisis = await analyzeImageModaFromDataUrl(dataUrl);
      productos.push({
        id: p.id,
        nombre,
        precio,
        imagen,
        link: p.canonical_url ?? "",
        ...analisis,
      });
      console.log(
        `✓ [${analisis.tipo_prenda}/${analisis.silueta_corte}/${analisis.patron}/${analisis.familia_color}/${analisis.textura_tela}/${analisis.formalidad_estilo}]`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log("✗ FALLÓ");
      console.log(`     └─ ${msg.split("\n")[0]}`);
      errores.push({ id: p.id, nombre, error: msg });
    }

    if (i < conPrecio.length - 1) {
      await delay(DELAY_MS);
    }
  }

  writeFileSync(CATALOGO_PATH, generarArchivoCatalogo(productos));

  console.log("\n──────────────────────────────────────────────");
  console.log(" Resumen");
  console.log("──────────────────────────────────────────────");
  console.log(`✓ Procesados con éxito: ${productos.length}`);
  console.log(`✗ Fallaron/omitidos:    ${errores.length}`);
  console.log(`→ Escrito en:           lib/catalogo-tiendanube.ts`);

  if (errores.length > 0) {
    console.log("\nErrores:");
    for (const e of errores) {
      console.log(`  • ${e.nombre} (#${e.id}): ${e.error.split("\n")[0]}`);
    }
  }
  console.log();
}

main().catch((err) => {
  console.error("\n✗ Error fatal:", err);
  process.exit(1);
});
