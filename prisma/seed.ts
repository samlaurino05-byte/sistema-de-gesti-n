import "dotenv/config";
import { PrismaClient, RoleName, SettingsModule, PermissionAction, ClientStatus } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "../src/lib/auth/password";
import {
  studioProfile,
  userRoleDescriptions,
  rolePermissions,
  settingsModuleOrder,
  permissionActionOrder,
  type UserRole,
} from "../src/lib/mock/settings";
import { clients as mockClients, type ClientStatus as MockClientStatus } from "../src/lib/mock/clients";

// Seed idempotente de datos base para Sprint 8.2 (autenticación). Se puede
// correr las veces que hagan falta: todo usa upsert sobre las mismas claves
// únicas del schema, nunca crea duplicados.
//
// Alcance deliberadamente mínimo: organización, roles, catálogo de
// permisos, matriz de RolePermission y un único usuario administrador con
// su Membership. NO crea Client/Employee/Invoice/HourEntry ni ningún otro
// dato de negocio — eso sigue viviendo en los mocks hasta que se migre cada
// módulo (fuera de alcance de este sprint).

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} no está definida. Revisá tu archivo .env (ver .env.example).`);
  }
  return value;
}

const DATABASE_URL = requireEnv("DATABASE_URL");
const SEED_ADMIN_PASSWORD = requireEnv("SEED_ADMIN_PASSWORD");

const SEED_ADMIN_EMAIL = "rodrigo.mendez@estudio.com.ar";
const SEED_ADMIN_NOMBRE = "Rodrigo Méndez";

// Mapeo entre las claves en español/minúscula del mock de Settings y los
// enums en mayúscula del schema de Prisma. Los valores del mock
// (rolePermissions, settingsModuleOrder, permissionActionOrder,
// userRoleDescriptions) son la fuente de verdad de "qué puede hacer cada
// rol", para que el seed nunca se desincronice de la matriz visual actual.
const ROLE_NAME_BY_MOCK_KEY: Record<UserRole, RoleName> = {
  administrador: RoleName.ADMINISTRADOR,
  supervisor: RoleName.SUPERVISOR,
  contador: RoleName.CONTADOR,
  colaborador: RoleName.COLABORADOR,
};

const MODULE_BY_MOCK_KEY: Record<(typeof settingsModuleOrder)[number], SettingsModule> = {
  dashboard: SettingsModule.DASHBOARD,
  clientes: SettingsModule.CLIENTES,
  facturacion: SettingsModule.FACTURACION,
  cobranzas: SettingsModule.COBRANZAS,
  empleados: SettingsModule.EMPLEADOS,
  horas: SettingsModule.HORAS,
  reportes: SettingsModule.REPORTES,
  configuracion: SettingsModule.CONFIGURACION,
};

const ACTION_BY_MOCK_KEY: Record<(typeof permissionActionOrder)[number], PermissionAction> = {
  ver: PermissionAction.VER,
  crear: PermissionAction.CREAR,
  editar: PermissionAction.EDITAR,
  eliminar: PermissionAction.ELIMINAR,
};

// Sprint 8.3: mapeo de estado de Cliente entre el mock (español/minúscula) y
// el enum de Prisma (mayúscula). mockClients es la fuente de verdad de los
// datos de cartera hasta que el módulo de Clientes tenga su propia UI de
// alta/edición.
const CLIENT_STATUS_BY_MOCK_KEY: Record<MockClientStatus, ClientStatus> = {
  activo: ClientStatus.ACTIVO,
  mora: ClientStatus.MORA,
  pausado: ClientStatus.PAUSADO,
  inactivo: ClientStatus.INACTIVO,
};

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "estudio-mendez" },
    update: {},
    create: {
      slug: "estudio-mendez",
      nombre: studioProfile.nombre,
      razonSocial: studioProfile.razonSocial,
      cuit: studioProfile.cuit,
      email: studioProfile.email,
      telefono: studioProfile.telefono,
      direccion: studioProfile.direccion,
      localidad: studioProfile.localidad,
      provincia: studioProfile.provincia,
      logoInitials: studioProfile.logoInitials,
    },
  });
  console.log(`Organization: ${organization.nombre} (${organization.id})`);

  const rolesByName = new Map<RoleName, { id: string }>();
  for (const [mockKey, roleName] of Object.entries(ROLE_NAME_BY_MOCK_KEY) as [UserRole, RoleName][]) {
    const role = await prisma.role.upsert({
      where: { organizationId_nombre: { organizationId: organization.id, nombre: roleName } },
      update: { descripcion: userRoleDescriptions[mockKey] },
      create: {
        organizationId: organization.id,
        nombre: roleName,
        descripcion: userRoleDescriptions[mockKey],
      },
    });
    rolesByName.set(roleName, role);
  }
  console.log(`Roles: ${rolesByName.size}`);

  const permissionsByKey = new Map<string, { id: string }>();
  for (const moduleKey of settingsModuleOrder) {
    for (const actionKey of permissionActionOrder) {
      const module = MODULE_BY_MOCK_KEY[moduleKey];
      const action = ACTION_BY_MOCK_KEY[actionKey];
      const permission = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action },
      });
      permissionsByKey.set(`${module}:${action}`, permission);
    }
  }
  console.log(`Permissions: ${permissionsByKey.size}`);

  let rolePermissionCount = 0;
  for (const [mockRoleKey, roleName] of Object.entries(ROLE_NAME_BY_MOCK_KEY) as [UserRole, RoleName][]) {
    const role = rolesByName.get(roleName)!;
    const moduleMatrix = rolePermissions[mockRoleKey];

    for (const moduleKey of settingsModuleOrder) {
      const modulePermission = moduleMatrix[moduleKey];
      for (const actionKey of permissionActionOrder) {
        const module = MODULE_BY_MOCK_KEY[moduleKey];
        const action = ACTION_BY_MOCK_KEY[actionKey];
        const permission = permissionsByKey.get(`${module}:${action}`)!;
        const allowed = modulePermission[actionKey];

        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: { allowed },
          create: { roleId: role.id, permissionId: permission.id, allowed },
        });
        rolePermissionCount += 1;
      }
    }
  }
  console.log(`RolePermission: ${rolePermissionCount}`);

  const passwordHash = await hashPassword(SEED_ADMIN_PASSWORD);
  const adminUser = await prisma.user.upsert({
    where: { email: SEED_ADMIN_EMAIL },
    update: { passwordHash },
    create: {
      email: SEED_ADMIN_EMAIL,
      nombre: SEED_ADMIN_NOMBRE,
      passwordHash,
      estado: "ACTIVO",
    },
  });
  console.log(`User administrador: ${adminUser.email}`);

  const adminRole = rolesByName.get(RoleName.ADMINISTRADOR)!;
  const membership = await prisma.membership.upsert({
    where: { userId_organizationId: { userId: adminUser.id, organizationId: organization.id } },
    update: { roleId: adminRole.id, estado: "ACTIVE" },
    create: {
      userId: adminUser.id,
      organizationId: organization.id,
      roleId: adminRole.id,
      estado: "ACTIVE",
    },
  });
  console.log(`Membership: ${membership.id} (estado=${membership.estado})`);

  // Nota: no se crea un Employee para este usuario. El seed está acotado a
  // lo necesario para autenticación (Sprint 8.2); armar un legajo de
  // Employee coherente implica datos de negocio (cargo, área, tarifa
  // horaria, condición contractual, etc.) que pertenecen al módulo de
  // Empleados, todavía no migrado a Prisma en este sprint. La relación
  // Membership.employeeId queda en null hasta entonces.

  // Sprint 8.3: alta de los clientes de la cartera mock en la Organization
  // de demostración. Se preserva el `id` del mock como `slug` (las URLs
  // /clients/<slug> no cambian). `responsableInternoId` queda en null: el
  // módulo de Empleados todavía no está migrado, así que no hay Employee
  // real contra el cual resolver la FK — evitamos inventar una relación
  // falsa (Employee mock e Employee real no comparten id). La UI resuelve
  // el nombre a mostrar con un fallback al mock mientras tanto (ver
  // src/lib/data/clients.ts).
  let clientCount = 0;
  for (const mockClient of mockClients) {
    await prisma.client.upsert({
      where: { organizationId_slug: { organizationId: organization.id, slug: mockClient.id } },
      update: {
        razonSocial: mockClient.razonSocial,
        nombreComercial: mockClient.nombreComercial,
        cuit: mockClient.cuit,
        condicionFiscal: mockClient.condicionFiscal,
        email: mockClient.email,
        telefono: mockClient.telefono,
        estado: CLIENT_STATUS_BY_MOCK_KEY[mockClient.estado],
        condicionPago: mockClient.condicionPago,
        valorHora: mockClient.valorHora,
        facturacionMensual: mockClient.facturacionMensual,
        fechaAlta: new Date(mockClient.fechaAlta),
      },
      create: {
        organizationId: organization.id,
        slug: mockClient.id,
        razonSocial: mockClient.razonSocial,
        nombreComercial: mockClient.nombreComercial,
        cuit: mockClient.cuit,
        condicionFiscal: mockClient.condicionFiscal,
        email: mockClient.email,
        telefono: mockClient.telefono,
        estado: CLIENT_STATUS_BY_MOCK_KEY[mockClient.estado],
        condicionPago: mockClient.condicionPago,
        valorHora: mockClient.valorHora,
        facturacionMensual: mockClient.facturacionMensual,
        fechaAlta: new Date(mockClient.fechaAlta),
      },
    });
    clientCount += 1;
  }
  console.log(`Clientes: ${clientCount}`);

  console.log("\nSeed completado.");
}

main()
  .catch((error) => {
    console.error("Seed falló:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
