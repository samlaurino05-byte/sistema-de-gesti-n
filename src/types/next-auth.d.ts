import type { DefaultSession } from "next-auth";

// Claims propios de este sistema, agregados en los callbacks jwt/session de
// src/auth.ts. `organizationId`/`membershipId`/`roleId` son null cuando el
// usuario todavía no tiene una organización activa resuelta (ver
// src/lib/auth/session.ts).
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    organizationId: string | null;
    organizationNombre: string | null;
    membershipId: string | null;
    roleId: string | null;
    roleNombre: string | null;
    pendingOrgSelection: boolean;
    availableOrganizations: { id: string; nombre: string }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    organizationId?: string | null;
    organizationNombre?: string | null;
    membershipId?: string | null;
    roleId?: string | null;
    roleNombre?: string | null;
    pendingOrgSelection?: boolean;
    availableOrganizations?: { id: string; nombre: string }[];
  }
}
