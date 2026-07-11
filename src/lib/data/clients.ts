import "server-only";
import { prisma } from "@/lib/prisma";
import { ClientStatus as PrismaClientStatus } from "@/generated/prisma/client";
import { getClientById as getMockClientById, type Client as ClientDTO, type ClientStatus } from "@/lib/mock/clients";
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

// El módulo de Empleados todavía no está migrado a Prisma, así que
// `responsableInternoId` queda en null para todos los clientes seedeados
// (ver prisma/seed.ts). En vez de inventar una relación falsa, mostramos el
// nombre del mock como texto informativo hasta que Empleados se migre y la
// FK pueda resolverse de verdad.
function resolveResponsableInterno(row: ClientRow): string {
  if (row.responsableInterno) {
    return row.responsableInterno.nombre;
  }
  return getMockClientById(row.slug)?.responsableInterno ?? "Sin responsable asignado";
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
