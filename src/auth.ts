import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

type MembershipWithRoleAndOrg = Awaited<ReturnType<typeof loadActiveMemberships>>[number];

function loadActiveMemberships(userId: string) {
  return prisma.membership.findMany({
    where: { userId, estado: "ACTIVE" },
    include: { organization: true, role: true },
  });
}

// Aplica la resolución de "organización activa" al token, a partir de las
// Membership ACTIVE del usuario:
// - 1 sola membresía -> se selecciona automáticamente.
// - 0 membresías -> queda sin organización (la UI debe avisar, no dar acceso).
// - 2+ membresías -> queda pendiente de selección explícita (ver
//   /select-organization), con la lista de organizaciones disponible.
function applyMembershipsToToken(
  token: Record<string, unknown>,
  memberships: MembershipWithRoleAndOrg[],
) {
  if (memberships.length === 1) {
    const [membership] = memberships;
    token.organizationId = membership.organizationId;
    token.organizationNombre = membership.organization.nombre;
    token.membershipId = membership.id;
    token.roleId = membership.roleId;
    token.roleNombre = membership.role.nombre;
    token.pendingOrgSelection = false;
    token.availableOrganizations = [];
    return;
  }

  token.organizationId = null;
  token.organizationNombre = null;
  token.membershipId = null;
  token.roleId = null;
  token.roleNombre = null;
  token.pendingOrgSelection = memberships.length > 1;
  token.availableOrganizations = memberships.map((m) => ({
    id: m.organizationId,
    nombre: m.organization.nombre,
  }));
}

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });

        // Mismo mensaje de error genérico en todos los casos de rechazo
        // (usuario inexistente, sin password, inactivo, o password incorrecta)
        // para no filtrar por enumeración qué emails existen en el sistema.
        if (!user || !user.passwordHash || user.estado !== "ACTIVO") {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.nombre };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.userId = user.id;
        const memberships = await loadActiveMemberships(user.id);
        applyMembershipsToToken(token, memberships);
      }

      // Selección explícita de organización activa (ver
      // /select-organization). Nunca se confía en el organizationId que
      // manda el cliente sin revalidar contra la base que ese usuario tiene
      // una Membership ACTIVE ahí.
      if (trigger === "update" && session?.organizationId && token.userId) {
        const membership = await prisma.membership.findFirst({
          where: {
            userId: token.userId as string,
            organizationId: session.organizationId as string,
            estado: "ACTIVE",
          },
          include: { organization: true, role: true },
        });

        if (membership) {
          token.organizationId = membership.organizationId;
          token.organizationNombre = membership.organization.nombre;
          token.membershipId = membership.id;
          token.roleId = membership.roleId;
          token.roleNombre = membership.role.nombre;
          token.pendingOrgSelection = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.organizationId = (token.organizationId as string | null | undefined) ?? null;
      session.organizationNombre = (token.organizationNombre as string | null | undefined) ?? null;
      session.membershipId = (token.membershipId as string | null | undefined) ?? null;
      session.roleId = (token.roleId as string | null | undefined) ?? null;
      session.roleNombre = (token.roleNombre as string | null | undefined) ?? null;
      session.pendingOrgSelection = Boolean(token.pendingOrgSelection);
      session.availableOrganizations =
        (token.availableOrganizations as { id: string; nombre: string }[] | undefined) ?? [];
      return session;
    },
  },
});
