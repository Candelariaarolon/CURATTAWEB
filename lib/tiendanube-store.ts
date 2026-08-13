import { prisma } from "@/lib/prisma";

// Capa de almacenamiento de tokens de tiendas Tiendanube conectadas.
// Usa la misma base Postgres (Prisma) que el resto de la app en vez de un
// archivo JSON, porque en Vercel el filesystem del proyecto es de solo
// lectura fuera de /tmp y /tmp no persiste entre invocaciones ni despliegues.

export type StoreToken = {
  userId: string; // id de la tienda en Tiendanube
  accessToken: string;
  updatedAt: string;
};

export async function saveStoreToken(
  userId: string,
  accessToken: string
): Promise<void> {
  await prisma.tiendanubeToken.upsert({
    where: { storeId: userId },
    create: { storeId: userId, accessToken },
    update: { accessToken },
  });
}

export async function getStoreToken(userId: string): Promise<StoreToken | null> {
  const token = await prisma.tiendanubeToken.findUnique({
    where: { storeId: userId },
  });

  if (!token) return null;

  return {
    userId: token.storeId,
    accessToken: token.accessToken,
    updatedAt: token.updatedAt.toISOString(),
  };
}
