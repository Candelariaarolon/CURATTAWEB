import { prisma } from "@/lib/prisma";

// API v5 de Pinterest: las respuestas de listado vienen envueltas en
// { items: [...], bookmark }. El conteo de pines de un board es `pin_count`.
// Las imágenes de un pin están en media.images, un objeto sin key fija
// ("150x150", "400x300", "600x", "orig", etc.) — hay que elegir con fallback.

export class PinterestTokenMissingError extends Error {
  constructor() {
    super("No hay token de Pinterest para este usuario. Completá el flujo de OAuth primero.");
    this.name = "PinterestTokenMissingError";
  }
}

export class PinterestTokenExpiredError extends Error {
  constructor() {
    super("El token de Pinterest expiró. Reconectá la cuenta vía /api/auth/pinterest.");
    this.name = "PinterestTokenExpiredError";
  }
}

export interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  pinCount: number;
}

export interface PinterestPin {
  id: string;
  url: string;
  image: string | null;
  description: string;
}

async function getValidAccessToken(userId: string): Promise<string> {
  const token = await prisma.pinterestToken.findUnique({ where: { userId } });
  if (!token) throw new PinterestTokenMissingError();

  // Los tokens trial de Pinterest duran ~24hs y no tienen refresh automático:
  // si expiró, el usuario tiene que reconectar manualmente.
  if (Date.now() >= token.expiresAt.getTime()) {
    throw new PinterestTokenExpiredError();
  }

  return token.accessToken;
}

export async function getUserBoards(userId: string): Promise<PinterestBoard[]> {
  const accessToken = await getValidAccessToken(userId);

  type BoardsResponse = {
    items: { id: string; name: string; description: string | null; pin_count: number }[];
    bookmark?: string | null;
  };

  const boards: PinterestBoard[] = [];
  let bookmark: string | undefined;

  // La API pagina los resultados y no respeta un page_size grande de forma
  // confiable: hay que seguir el `bookmark` hasta que la API deje de mandarlo.
  do {
    const params = new URLSearchParams({ page_size: "250" });
    if (bookmark) params.set("bookmark", bookmark);

    const res = await fetch(`https://api.pinterest.com/v5/boards?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Pinterest boards fetch failed: ${res.status}`);

    const data = (await res.json()) as BoardsResponse;
    boards.push(
      ...data.items.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description ?? "",
        pinCount: b.pin_count,
      }))
    );
    bookmark = data.bookmark ?? undefined;
  } while (bookmark);

  return boards;
}

export async function getBoardPins(
  userId: string,
  boardId: string,
  limit = 25
): Promise<PinterestPin[]> {
  const accessToken = await getValidAccessToken(userId);
  const params = new URLSearchParams({ page_size: String(limit) });
  const res = await fetch(
    `https://api.pinterest.com/v5/boards/${boardId}/pins?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Pinterest pins fetch failed: ${res.status}`);

  const data = (await res.json()) as {
    items: {
      id: string;
      link: string | null;
      description: string | null;
      title: string | null;
      media?: { images?: Record<string, { url: string }> };
    }[];
  };

  return data.items.map((p) => {
    const images = p.media?.images ?? {};
    const image =
      images["600x"]?.url ?? images.orig?.url ?? Object.values(images)[0]?.url ?? null;
    return {
      id: p.id,
      url: p.link ?? "",
      image,
      description: p.description || p.title || "",
    };
  });
}
