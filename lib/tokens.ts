import { randomBytes } from "crypto";

// Tokens de un solo uso (verificación de mail, reset de contraseña).
// randomBytes (CSPRNG) en vez de Math.random, que no es seguro para esto.
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24hs
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
