import "server-only";
import { prisma } from "@/lib/prisma";
import { EmployeeStatus as PrismaEmployeeStatus } from "@/generated/prisma/client";
import type { Employee as EmployeeDTO, EmployeeStatus } from "@/lib/mock/employees";

// Capa central de acceso a datos del módulo Empleados (Sprint 8.4). Mismo
// patrón que src/lib/data/clients.ts: los componentes visuales consumen
// empleados a través de estas funciones, nunca importan Prisma
// directamente, y toda query filtra explícitamente por organizationId
// (que debe salir de la sesión activa, ver src/lib/auth/session.ts).

const STATUS_TO_DTO: Record<PrismaEmployeeStatus, EmployeeStatus> = {
  [PrismaEmployeeStatus.ACTIVO]: "activo",
  [PrismaEmployeeStatus.VACACIONES]: "vacaciones",
  [PrismaEmployeeStatus.LICENCIA]: "licencia",
  [PrismaEmployeeStatus.INACTIVO]: "inactivo",
};

type EmployeeRow = {
  slug: string;
  nombre: string;
  cargo: string;
  area: string;
  estado: PrismaEmployeeStatus;
  valorHoraInterno: { toNumber(): number };
  email: string;
  telefono: string;
  cuil: string;
  direccion: string;
  condicionContractual: string;
  fechaIngreso: Date;
};

// Todos los campos del mock Employee tienen equivalente 1:1 en el modelo
// Prisma (ver comparación en el resumen del sprint) — no hay datos
// secundarios que resolver acá, a diferencia de Clientes.
function toEmployeeDTO(row: EmployeeRow): EmployeeDTO {
  return {
    id: row.slug,
    nombre: row.nombre,
    cargo: row.cargo,
    area: row.area,
    estado: STATUS_TO_DTO[row.estado],
    valorHoraInterno: row.valorHoraInterno.toNumber(),
    email: row.email,
    telefono: row.telefono,
    cuil: row.cuil,
    direccion: row.direccion,
    condicionContractual: row.condicionContractual,
    fechaIngreso: row.fechaIngreso.toISOString().slice(0, 10),
  };
}

export async function getEmployeesForOrganization(organizationId: string): Promise<EmployeeDTO[]> {
  const rows = await prisma.employee.findMany({
    where: { organizationId },
    orderBy: { nombre: "asc" },
  });

  return rows.map(toEmployeeDTO);
}

export async function getEmployeeBySlugForOrganization(
  slug: string,
  organizationId: string
): Promise<EmployeeDTO | null> {
  const row = await prisma.employee.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
  });

  return row ? toEmployeeDTO(row) : null;
}
