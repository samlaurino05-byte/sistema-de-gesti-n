import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActiveSession = {
  userId: string;
  email: string;
  nombre: string;
  organizationId: string;
  organizationNombre: string;
  membershipId: string;
  roleId: string;
  roleNombre: string;
};

export type SessionState =
  | { status: "unauthenticated" }
  | {
      status: "needsOrganization";
      userId: string;
      email: string;
      nombre: string;
      organizations: { id: string; nombre: string }[];
    }
  | { status: "noOrganization"; userId: string; email: string; nombre: string }
  | { status: "active"; session: ActiveSession };

// Fuente única de verdad de "quién es el usuario actual y en qué
// organización está trabajando". El middleware (edge) solo sabe que hay un
// token; acá se revalida contra la base en cada request server-side que la
// llame — cumple los requisitos de seguridad de validar User.estado ACTIVO
// y Membership.estado ACTIVE, no solo confiar en el JWT firmado en el login.
//
// `cache()` de React deduplica esta consulta dentro de un mismo request
// (varios componentes pueden llamarla sin generar queries repetidas).
export const getSessionState = cache(async (): Promise<SessionState> => {
  const authSession = await auth();

  if (!authSession?.user?.id) {
    return { status: "unauthenticated" };
  }

  const userId = authSession.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.estado !== "ACTIVO") {
    return { status: "unauthenticated" };
  }

  if (authSession.pendingOrgSelection) {
    return {
      status: "needsOrganization",
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      organizations: authSession.availableOrganizations,
    };
  }

  if (!authSession.organizationId || !authSession.membershipId) {
    return { status: "noOrganization", userId: user.id, email: user.email, nombre: user.nombre };
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: authSession.membershipId,
      userId: user.id,
      organizationId: authSession.organizationId,
      estado: "ACTIVE",
    },
    include: { organization: true, role: true },
  });

  if (!membership) {
    return { status: "unauthenticated" };
  }

  return {
    status: "active",
    session: {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      organizationId: membership.organizationId,
      organizationNombre: membership.organization.nombre,
      membershipId: membership.id,
      roleId: membership.roleId,
      roleNombre: membership.role.nombre,
    },
  };
});

export async function getActiveSession(): Promise<ActiveSession | null> {
  const state = await getSessionState();
  return state.status === "active" ? state.session : null;
}

// Para usar en layouts/páginas server-side que requieren sesión + org
// activa resueltas. Redirige a /login o /select-organization según
// corresponda en vez de dejar pasar una página a medio autenticar.
export async function requireActiveSession(): Promise<ActiveSession> {
  const state = await getSessionState();

  switch (state.status) {
    case "active":
      return state.session;
    case "needsOrganization":
      redirect("/select-organization");
    case "noOrganization":
      redirect("/login?error=no-organization");
    case "unauthenticated":
      redirect("/login");
  }
}
