import "server-only";
import { prisma } from "@/lib/prisma";
import { HourEntryStatus as PrismaHourEntryStatus } from "@/generated/prisma/client";
import type { HourEntry as HourEntryDTO, HourEntryStatus } from "@/lib/mock/hours";

// Capa central de acceso a datos del módulo Horas (Sprint 8.5A). Mismo
// patrón que src/lib/data/clients.ts y src/lib/data/employees.ts: los
// componentes visuales consumen horas a través de estas funciones, nunca
// importan Prisma directamente, y toda query filtra explícitamente por
// organizationId (que debe salir de la sesión activa, ver
// src/lib/auth/session.ts).
//
// Alcance de este sprint: solo lectura. Alta/edición/eliminación/aprobación
// y la relación con Facturación (InvoiceItem.hourEntryId) quedan para un
// sprint posterior.

const STATUS_TO_DTO: Record<PrismaHourEntryStatus, HourEntryStatus> = {
  [PrismaHourEntryStatus.PENDIENTE]: "pendiente",
  [PrismaHourEntryStatus.APROBADA]: "aprobada",
  [PrismaHourEntryStatus.RECHAZADA]: "rechazada",
  [PrismaHourEntryStatus.FACTURADA]: "facturada",
};

type HourEntryRow = {
  id: string;
  fecha: Date;
  proyecto: string;
  horas: { toNumber(): number };
  descripcion: string;
  estado: PrismaHourEntryStatus;
  valorHoraInterno: { toNumber(): number };
  valorHoraCliente: { toNumber(): number };
  employee: { slug: string };
  client: { slug: string };
};

// `select` explícito en vez de `include`: el DTO no usa organizationId,
// employeeId/clientId crudos ni createdAt/updatedAt, así que no tiene
// sentido traerlos de la base en cada query — se listan acá exactamente
// las columnas que `toHourEntryDTO` necesita.
const HOUR_ENTRY_SELECT = {
  id: true,
  fecha: true,
  proyecto: true,
  horas: true,
  descripcion: true,
  estado: true,
  valorHoraInterno: true,
  valorHoraCliente: true,
  employee: { select: { slug: true } },
  client: { select: { slug: true } },
} as const;

// `invoiceId` del DTO mock no tiene equivalente acá todavía: en Prisma la
// relación con Facturación se resuelve al revés, vía
// InvoiceItem.hourEntryId (ver prisma/schema.prisma y
// docs/architecture.md), y Facturación sigue sin migrar. Se omite a
// propósito — HourRow ya maneja el caso de que no haya invoiceId (no
// muestra el link a la factura).
function toHourEntryDTO(row: HourEntryRow): HourEntryDTO {
  return {
    id: row.id,
    fecha: row.fecha.toISOString().slice(0, 10),
    employeeId: row.employee.slug,
    clientId: row.client.slug,
    proyecto: row.proyecto,
    horas: row.horas.toNumber(),
    valorHoraInterno: row.valorHoraInterno.toNumber(),
    valorHoraCliente: row.valorHoraCliente.toNumber(),
    descripcion: row.descripcion,
    estado: STATUS_TO_DTO[row.estado],
  };
}

export async function getHourEntriesForOrganization(organizationId: string): Promise<HourEntryDTO[]> {
  const rows = await prisma.hourEntry.findMany({
    where: { organizationId },
    select: HOUR_ENTRY_SELECT,
    orderBy: { createdAt: "asc" },
  });

  return rows.map(toHourEntryDTO);
}

export async function getHourEntriesForEmployee(
  organizationId: string,
  employeeIdentifier: string
): Promise<HourEntryDTO[]> {
  const rows = await prisma.hourEntry.findMany({
    where: { organizationId, employee: { organizationId, slug: employeeIdentifier } },
    select: HOUR_ENTRY_SELECT,
    orderBy: { createdAt: "asc" },
  });

  return rows.map(toHourEntryDTO);
}

export async function getHourEntriesForClient(
  organizationId: string,
  clientIdentifier: string
): Promise<HourEntryDTO[]> {
  const rows = await prisma.hourEntry.findMany({
    where: { organizationId, client: { organizationId, slug: clientIdentifier } },
    select: HOUR_ENTRY_SELECT,
    orderBy: { createdAt: "asc" },
  });

  return rows.map(toHourEntryDTO);
}

// Sprint 8.6A: usado por src/lib/data/invoices.ts para resolver las horas
// incluidas en una factura (vía InvoiceItem.hourEntryId). Vive acá, no en
// invoices.ts, para no duplicar el mapeo de HourEntryStatus/Decimal — Horas
// sigue siendo la única fuente de verdad de cómo se lee un HourEntry.
export async function getHourEntriesByIds(organizationId: string, hourEntryIds: string[]): Promise<HourEntryDTO[]> {
  if (hourEntryIds.length === 0) return [];

  const rows = await prisma.hourEntry.findMany({
    where: { organizationId, id: { in: hourEntryIds } },
    select: HOUR_ENTRY_SELECT,
    orderBy: { createdAt: "asc" },
  });

  return rows.map(toHourEntryDTO);
}
