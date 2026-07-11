// Prisma 7: los comandos de CLI (migrate, studio, db pull) usan la conexión
// directa (no pooleada) definida acá. El runtime de la app usa un driver
// adapter aparte (ver src/lib/prisma.ts) con la conexión pooleada, que es la
// recomendada por Neon para queries de la aplicación.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
