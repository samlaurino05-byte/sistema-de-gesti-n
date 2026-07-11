import "dotenv/config";
import {
  PrismaClient,
  RoleName,
  SettingsModule,
  PermissionAction,
  ClientStatus,
  EmployeeStatus,
} from "../src/generated/prisma/client";
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
import { employees as mockEmployees, type EmployeeStatus as MockEmployeeStatus } from "../src/lib/mock/employees";

// Seed idempotente de datos base (Sprint 8.2 autenticación, 8.3 Clientes,
// 8.4 Empleados). Se puede correr las veces que hagan falta: todo usa
// upsert sobre las mismas claves únicas del schema, nunca crea duplicados.
//
// Crea: organización, roles, catálogo de permisos, matriz de
// RolePermission, un usuario administrador con su Membership, los
// Employee y Client de la cartera mock (con responsableInternoId
// resuelto cuando corresponde). NO crea Invoice/HourEntry ni ningún otro
// dato de negocio — esos módulos siguen sin migrar (fuera de alcance de
// este sprint).

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

// Sprint 8.4: mismo mapeo para el estado de Employee.
const EMPLOYEE_STATUS_BY_MOCK_KEY: Record<MockEmployeeStatus, EmployeeStatus> = {
  activo: EmployeeStatus.ACTIVO,
  vacaciones: EmployeeStatus.VACACIONES,
  licencia: EmployeeStatus.LICENCIA,
  inactivo: EmployeeStatus.INACTIVO,
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

  // Sprint 8.4: alta de los empleados de la cartera mock en la Organization
  // de demostración. Se preserva el `id` del mock como `slug` (las URLs
  // /employees/<slug> no cambian). Todos los campos del mock tienen
  // representación directa en el modelo Employee — no hizo falta tocar el
  // schema (ver comparación en el resumen del sprint).
  const employeesByNombre = new Map<string, { id: string }[]>();
  let employeeCount = 0;
  for (const mockEmployee of mockEmployees) {
    const employee = await prisma.employee.upsert({
      where: { organizationId_slug: { organizationId: organization.id, slug: mockEmployee.id } },
      update: {
        nombre: mockEmployee.nombre,
        cargo: mockEmployee.cargo,
        area: mockEmployee.area,
        estado: EMPLOYEE_STATUS_BY_MOCK_KEY[mockEmployee.estado],
        valorHoraInterno: mockEmployee.valorHoraInterno,
        email: mockEmployee.email,
        telefono: mockEmployee.telefono,
        cuil: mockEmployee.cuil,
        direccion: mockEmployee.direccion,
        condicionContractual: mockEmployee.condicionContractual,
        fechaIngreso: new Date(mockEmployee.fechaIngreso),
      },
      create: {
        organizationId: organization.id,
        slug: mockEmployee.id,
        nombre: mockEmployee.nombre,
        cargo: mockEmployee.cargo,
        area: mockEmployee.area,
        estado: EMPLOYEE_STATUS_BY_MOCK_KEY[mockEmployee.estado],
        valorHoraInterno: mockEmployee.valorHoraInterno,
        email: mockEmployee.email,
        telefono: mockEmployee.telefono,
        cuil: mockEmployee.cuil,
        direccion: mockEmployee.direccion,
        condicionContractual: mockEmployee.condicionContractual,
        fechaIngreso: new Date(mockEmployee.fechaIngreso),
      },
    });
    employeeCount += 1;
    employeesByNombre.set(mockEmployee.nombre, [...(employeesByNombre.get(mockEmployee.nombre) ?? []), employee]);
  }
  console.log(`Empleados: ${employeeCount}`);

  // Resuelve un nombre de responsable/empleado a un Employee real SOLO
  // cuando hay exactamente una coincidencia por nombre dentro de la
  // organización. Ante cero o más de una coincidencia, no se vincula
  // (evita relaciones ambiguas o inventadas) — se usa tanto para
  // Membership.employeeId como para Client.responsableInternoId más abajo.
  function resolveUniqueEmployeeIdByNombre(nombre: string): string | null {
    const matches = employeesByNombre.get(nombre);
    return matches && matches.length === 1 ? matches[0].id : null;
  }

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

  // El User admin (Rodrigo Méndez) y el Employee "rodrigo-mendez" del mock
  // comparten nombre Y email (rodrigo.mendez@estudio.com.ar) — señal
  // inequívoca de que representan la misma persona. Se vincula
  // Membership.employeeId a ese Employee ya creado arriba; no se inventa
  // cargo, tarifa ni condición laboral, se usan los mismos datos del mock
  // que ya se migraron como Employee. Si en el futuro esa coincidencia
  // dejara de ser 1:1 (ej. dos empleados con el mismo nombre), queda en
  // null automáticamente.
  const rodrigoEmployeeMock = mockEmployees.find((employee) => employee.nombre === SEED_ADMIN_NOMBRE);
  const adminEmployeeId =
    rodrigoEmployeeMock?.email === SEED_ADMIN_EMAIL ? resolveUniqueEmployeeIdByNombre(SEED_ADMIN_NOMBRE) : null;

  const adminRole = rolesByName.get(RoleName.ADMINISTRADOR)!;
  const membership = await prisma.membership.upsert({
    where: { userId_organizationId: { userId: adminUser.id, organizationId: organization.id } },
    update: { roleId: adminRole.id, estado: "ACTIVE", employeeId: adminEmployeeId },
    create: {
      userId: adminUser.id,
      organizationId: organization.id,
      roleId: adminRole.id,
      estado: "ACTIVE",
      employeeId: adminEmployeeId,
    },
  });
  console.log(`Membership: ${membership.id} (estado=${membership.estado}, employeeId=${membership.employeeId})`);

  // Sprint 8.3: alta de los clientes de la cartera mock en la Organization
  // de demostración. Se preserva el `id` del mock como `slug` (las URLs
  // /clients/<slug> no cambian).
  //
  // Sprint 8.4: además de los datos propios, se resuelve
  // `responsableInternoId` contra los Employee reales recién creados,
  // matcheando por nombre (`Client.responsableInterno` del mock vs
  // `Employee.nombre`). Solo se vincula si el nombre matchea exactamente
  // un Employee de la organización; si no matchea ninguno o matchea más de
  // uno, queda en null (ver resolveUniqueEmployeeIdByNombre).
  let clientCount = 0;
  let clientesVinculados = 0;
  const clientesSinVincular: string[] = [];
  for (const mockClient of mockClients) {
    const responsableInternoId = resolveUniqueEmployeeIdByNombre(mockClient.responsableInterno);
    if (responsableInternoId) {
      clientesVinculados += 1;
    } else {
      clientesSinVincular.push(`${mockClient.id} (responsable mock: "${mockClient.responsableInterno}")`);
    }

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
        responsableInternoId,
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
        responsableInternoId,
      },
    });
    clientCount += 1;
  }
  console.log(`Clientes: ${clientCount}`);
  console.log(`Clientes vinculados a Employee real: ${clientesVinculados}`);
  if (clientesSinVincular.length > 0) {
    console.log(`Clientes sin vincular: ${clientesSinVincular.join(", ")}`);
  }

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
