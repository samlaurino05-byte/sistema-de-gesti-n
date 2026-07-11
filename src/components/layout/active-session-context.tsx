"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ActiveSession } from "@/lib/auth/session";

const ActiveSessionContext = createContext<ActiveSession | null>(null);

export function ActiveSessionProvider({
  session,
  children,
}: {
  session: ActiveSession;
  children: ReactNode;
}) {
  return <ActiveSessionContext.Provider value={session}>{children}</ActiveSessionContext.Provider>;
}

// Solo se usa dentro de (app), donde el layout ya garantizó (server-side,
// vía requireActiveSession) que hay una sesión activa — por eso lanza en
// vez de devolver null: un uso fuera de ese árbol es un error de programación.
export function useActiveSession(): ActiveSession {
  const session = useContext(ActiveSessionContext);
  if (!session) {
    throw new Error("useActiveSession debe usarse dentro de ActiveSessionProvider");
  }
  return session;
}
