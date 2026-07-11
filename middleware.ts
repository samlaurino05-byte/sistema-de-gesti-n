import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Instancia liviana de NextAuth, construida solo con la config edge-safe
// (sin provider de Credentials ni Prisma): esta es la que corre en el
// runtime Edge del middleware. Solo puede verificar que exista un token de
// sesión válido; la revalidación autoritativa de User/Membership activos
// (contra la base) ocurre en src/lib/auth/session.ts, que corre en Node.js
// dentro de cada layout/página protegida.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
