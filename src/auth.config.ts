import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sin providers ni nada que importe Prisma/bcrypt. La usa
// tanto `middleware.ts` (que corre en el runtime Edge) como `auth.ts` (que sí
// agrega el provider de Credentials y corre en Node.js). Mantenerlos
// separados evita que el bundle de middleware arrastre el driver de Neon.
export const authConfig = {
  // Requerido por Auth.js v5 para confiar en el header Host fuera de modo
  // desarrollo (en dev se confía automáticamente en localhost; en
  // producción — `next start` — hay que declararlo explícitamente o falla
  // con "UntrustedHost"). Self-hosted (sin Vercel), sin dominio fijo
  // todavía vía AUTH_URL: `trustHost: true` es el remedio documentado por
  // Auth.js para este caso.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;

      const isPublicRoute =
        pathname === "/login" ||
        pathname.startsWith("/api/auth");

      if (isPublicRoute) return true;
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
