// Auth propia (JWT + cookie httpOnly vía lib/session.ts) — no NextAuth.
// Se re-exporta `auth()` con el mismo nombre e import path (`@/auth`) que
// usaba next-auth para no tener que tocar cada route handler y server
// component que ya llamaba `await auth()`.
export { auth } from "@/lib/session";
