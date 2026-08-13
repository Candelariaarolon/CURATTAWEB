import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Sesiones propias (no NextAuth): JWT firmado con jose, guardado en una
// cookie httpOnly. El payload lleva id/email directo — evita un round-trip
// a la base en cada request que solo necesita saber quién está logueado.

export const SESSION_COOKIE = "curatta_session";
const SESSION_DURATION = "7d";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Falta la variable de entorno JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// Firma compatible con next-auth's `auth()`: { user: { id, email } } | null.
// Mantiene sin cambios a todos los route handlers y server components que
// ya llamaban `await auth()`.
export async function auth(): Promise<{ user: SessionPayload & { id: string } } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  return { user: { id: payload.userId, ...payload } };
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
