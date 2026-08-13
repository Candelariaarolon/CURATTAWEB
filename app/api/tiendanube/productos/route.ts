import { NextRequest, NextResponse } from "next/server";
import { getProductos } from "@/lib/tiendanube";

export const runtime = "nodejs";

// Ruta de debug para inspeccionar la respuesta cruda de una tienda conectada.
// Requiere ?storeId=<id de la tienda en Tiendanube>.
export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "Falta el query param storeId" }, { status: 400 });
  }

  try {
    const productos = await getProductos(storeId);

    // Log temporal para inspeccionar la estructura real (imágenes, precio,
    // variantes, categorías) y poder mapearla en lib/catalogo.ts.
    console.log("[tiendanube/productos] Respuesta cruda:", JSON.stringify(productos, null, 2));

    return NextResponse.json(productos);
  } catch (err) {
    console.error("[tiendanube/productos] Error:", err);
    return NextResponse.json({ error: "No se pudo obtener productos de Tiendanube" }, { status: 500 });
  }
}
