"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Reemplaza next-auth's SessionProvider/useSession/signOut. La cookie de
// sesión es httpOnly (no la puede leer JS), así que este provider hidrata
// el estado pegándole a /api/auth/me una vez al montar.

type SessionUser = { id: string; email: string };
type Status = "loading" | "authenticated" | "unauthenticated";

type Ctx = {
  data: { user: SessionUser } | null;
  status: Status;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Ctx["data"]>(null);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const body = (await res.json()) as { user: SessionUser | null };
      if (body.user) {
        setData({ user: body.user });
        setStatus("authenticated");
      } else {
        setData(null);
        setStatus("unauthenticated");
      }
    } catch {
      setData(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ data, status, refresh }), [data, status, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <AuthSessionProvider>");
  }
  return ctx;
}

export async function signOut({ callbackUrl = "/" }: { callbackUrl?: string } = {}) {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = callbackUrl;
}
