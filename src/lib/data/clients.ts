import "server-only";
import { prisma } from "@/lib/prisma";
import { ClientStatus as PrismaClientStatus } from "@/generated/prisma/client";
import type { Client as ClientDTO, ClientStatus } from "@/lib/mock/clients";
import { getInvoicesForClient, summarizeInvoices } from "@/lib/mock/invoices";

// Capa central de acceso a datos del módulo Clientes (Sprint 8.3). Todo
// componente visual debe consumir clientes a través de estas funciones, no
// importar Prisma directamente. Cada query filtra explícitamente por
// organizationId: nunca se acepta un organizationId "libre" sin que haya
// salido de la sesión activa (ver src/lib/auth/session.ts).

const STATUS_TO_DTO: Record<PrismaClientStatus, ClientStatus> = {
  [PrismaClientStatus.ACTIVO]: "activo",
  [PrismaClientStatus.MORA]: "mora",
  [PrismaClientStatus.PAUSADO]: "pausado",
  [PrismaClientStatus.INACTIVO]: "inactivo",
};

type ClientRow = {
  slug: string;
  razonSocial: string;
  nombreComercial: string;
  cuit: string;
  condicionFiscal: string;
  email: string;
  telefono: string;
  estado: PrismaClientStatus;
  condicionPago: string;
  valorHora: { toNumber(): number };
  facturacionMensual: { toNumber(): number };
  fechaAlta: Date;
  responsableInterno: { nombre: string } | null;
};

const CLIENT_INCLUDE = { responsableInterno: { select: { nombre: true } } } as const;

// `deudaPendiente` todavía no se puede calcular desde datos reales: depende
// de Invoice/Payment, que siguen sin migrar (fuera de alcance de este
// sprint). Se deriva del mock de facturas, indexado por el mismo slug que
// ahora es la identidad real del cliente — igual que ya hacía el workspace
// de cliente antes de esta migración.
function resolveDeudaPendiente(slug: string): number {
  const summary = summarizeInvoices(getInvoicesForClient(slug));
  return summary.pendienteCobro + summary.vencido;
}

// Sprint 8.4: Empleados ya está migrado y el seed resolvió
// responsableInternoId para los 12 clientes de la cartera demo (ver
// prisma/seed.ts) matcheando por nombre contra los Employee reales. Se
// prioriza siempre esa relación real. El fallback a texto fijo queda solo
// para el caso legítimo de un cliente sin responsable asignado en DB (no
// para "todavía no migramos Empleados" — eso ya no aplica) — no hay ningún
// cliente en ese caso hoy, pero la UI debe seguir siendo correcta si en el
// futuro se da de alta un cliente sin responsableInternoId.
function resolveResponsableInterno(row: ClientRow): string {
  return row.responsableInterno?.nombre ?? "Sin responsable asignado";
}

function toClientDTO(row: ClientRow): ClientDTO {
  return {
    id: row.slug,
    razonSocial: row.razonSocial,
    nombreComercial: row.nombreComercial,
    cuit: row.cuit,
    condicionFiscal: row.condicionFiscal,
    email: row.email,
    telefono: row.telefono,
    responsableInterno: resolveResponsableInterno(row),
    estado: STATUS_TO_DTO[row.estado],
    condicionPago: row.condicionPago,
    valorHora: row.valorHora.toNumber(),
    deudaPendiente: resolveDeudaPendiente(row.slug),
    facturacionMensual: row.facturacionMensual.toNumber(),
    fechaAlta: row.fechaAlta.toISOString().slice(0, 10),
  };
}

export async function getClientsForOrganization(organizationId: string): Promise<ClientDTO[]> {
  const rows = await prisma.client.findMany({
    where: { organizationId },
    include: CLIENT_INCLUDE,
    orderBy: { razonSocial: "asc" },
  });

  return rows.map(toClientDTO);
}

export async function getClientBySlugForOrganization(
  slug: string,
  organizationId: string
): Promise<ClientDTO | null> {
  const row = await prisma.client.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
    include: CLIENT_INCLUDE,
  });

  return row ? toClientDTO(row) : null;
}

// Sprint 8.4: usado por el workspace de Empleados ("Clientes asignados").
// Filtra por la relación real (Client.responsableInternoId -> Employee),
// no por coincidencia de texto — reemplaza el matching por nombre que
// hacía el mock (getAssignedClients). Se filtra por el slug del empleado
// dentro de la misma organización, sin exponer su id interno de Prisma.
export async function getClientsAssignedToEmployee(
  employeeSlug: string,
  organizationId: string
): Promise<ClientDTO[]> {
  const rows = await prisma.client.findMany({
    where: { organizationId, responsableInterno: { organizationId, slug: employeeSlug } },
    include: CLIENT_INCLUDE,
    orderBy: { razonSocial: "asc" },
  });

  return rows.map(toClientDTO);
}
