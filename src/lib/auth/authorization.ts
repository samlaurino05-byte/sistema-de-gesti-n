import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { SettingsModule, type PermissionAction } from "@/generated/prisma/client";
import type { ActiveSession } from "@/lib/auth/session";

const ALL_MODULES = Object.values(SettingsModule);

// Deduplicado por roleId dentro del mismo request. Todavía no está
// conectado a ninguna pantalla (la matriz visual de Configuración sigue
// siendo mock, ver Sprint 8.2) — queda preparado para cuando se conecte.
const getRolePermissionSet = cache(async (roleId: string): Promise<Set<string>> => {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId, allowed: true },
    include: { permission: true },
  });

  return new Set(rolePermissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`));
});

export async function can(
  session: ActiveSession | null,
  module: SettingsModule,
  action: PermissionAction,
): Promise<boolean> {
  if (!session) return false;
  const permissions = await getRolePermissionSet(session.roleId);
  return permissions.has(`${module}:${action}`);
}

// Un módulo es "accesible" si el rol tiene permiso VER sobre él — mismo
// criterio que `getAccessibleModules` en src/lib/mock/settings.ts.
export async function getAccessibleModules(session: ActiveSession | null): Promise<SettingsModule[]> {
  if (!session) return [];
  const permissions = await getRolePermissionSet(session.roleId);
  return ALL_MODULES.filter((module) => permissions.has(`${module}:VER`));
}
