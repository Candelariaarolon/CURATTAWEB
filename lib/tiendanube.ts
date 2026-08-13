import { getStoreToken } from "@/lib/tiendanube-store";

// Tiendanube API v1: los productos se piden con el store_id en la URL y
// autenticación por header "Authentication: bearer {token}" (no "Authorization").
// La API exige un User-Agent identificable con datos de contacto de la app.
//
// El token NO se guarda en variables de entorno: cada tienda que se conecta a
// Curatta (flujo OAuth en app/api/tiendanube/callback) queda guardada en la
// tabla TiendanubeToken, así que acá se lee de ahí — así el catálogo puede
// crecer a todas las tiendas conectadas, no solo a una fija por env var.

export class TiendanubeStoreNotConnectedError extends Error {
  constructor(storeId: string) {
    super(`La tienda ${storeId} no está conectada a Curatta (no hay token guardado).`);
    this.name = "TiendanubeStoreNotConnectedError";
  }
}

const PER_PAGE = 200;

export async function getProductos(storeId: string): Promise<unknown[]> {
  const token = await getStoreToken(storeId);
  if (!token) throw new TiendanubeStoreNotConnectedError(storeId);

  const productos: unknown[] = [];
  let page = 1;

  // La API pagina de a PER_PAGE; se sigue pidiendo hasta que una página
  // vuelva vacía, para no truncar el catálogo si la tienda crece.
  for (;;) {
    const res = await fetch(
      `https://api.tiendanube.com/v1/${storeId}/products?page=${page}&per_page=${PER_PAGE}`,
      {
        headers: {
          Authentication: `bearer ${token.accessToken}`,
          "User-Agent": "Curatta (candeerolonn@gmail.com)",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Tiendanube products fetch failed: ${res.status}`);
    }

    const pagina = (await res.json()) as unknown[];
    productos.push(...pagina);
    if (pagina.length < PER_PAGE) break;
    page++;
  }

  return productos;
}
