import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Sprint 8.1: cliente de base de datos preparado, todavía no usado por
// ningún módulo visual (esos siguen leyendo de src/lib/mock).
//
// Usa la connection string "pooled" de Neon (DATABASE_URL) — la indicada
// para queries de la aplicación en runtime. Las migraciones usan la
// conexión directa configurada en prisma.config.ts (DIRECT_URL).

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida. Revisá tu archivo .env (ver .env.example).");
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
