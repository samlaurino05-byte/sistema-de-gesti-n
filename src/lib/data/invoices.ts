import "server-only";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus as PrismaInvoiceStatus } from "@/generated/prisma/client";
import type { InvoiceStatus } from "@/lib/mock/invoices";
import { getHourEntriesByIds } from "@/lib/data/hours";
import type { HourEntry } from "@/lib/mock/hours";

// Capa central de acceso a datos del módulo Facturación (Sprint 8.6A). Mismo
// patrón que src/lib/data/clients.ts, employees.ts y hours.ts: los
// componentes visuales consumen facturas exclusivamente a través de estas
// funciones, nunca importan Prisma directamente, y toda query filtra
// explícitamente por organizationId (que debe salir de la sesión activa,
// ver src/lib/auth/session.ts).
//
// Regla de arquitectura (Sprint 8.6A): toda la lógica de negocio de
// Facturación — resolución de cliente, cálculo de saldo pendiente, mapeo de
// estado — vive acá, no en páginas ni componentes. Los DTOs que exponen
// estas funciones ya traen resuelto todo lo que la UI necesita; ningún
// componente debería volver a calcular saldo/estado/cliente/pagos/totales.
//
// Alcance de este sprint: solo lectura. Emisión real, numeración automática
// y registro de pagos quedan para Sprint 8.6B.

const STATUS_TO_DTO: Record<PrismaInvoiceStatus, InvoiceStatus> = {
  [PrismaInvoiceStatus.BORRADOR]: "borrador",
  [PrismaInvoiceStatus.EMITIDA]: "emitida",
  [PrismaInvoiceStatus.PAGADA]: "pagada",
  [PrismaInvoiceStatus.VENCIDA]: "vencida",
  [PrismaInvoiceStatus.ANULADA]: "anulada",
};

// `saldoPendiente` nunca se persiste (ver nota de diseño en
// prisma/schema.prisma): se deriva de `total - Σ Payment.monto`. Un
// BORRADOR no fue emitido todavía (no hay nada "pendiente de cobro" de un
// comprobante que ni siquiera se envió) y una ANULADA no genera saldo por
// definición — en ambos casos es 0 sin importar los pagos, igual que ya
// hacía el mock (donde ambos casos son datos hardcodeados en 0).
function computeSaldoPendiente(
  estado: PrismaInvoiceStatus,
  total: number,
  payments: { monto: { toNumber(): number } }[]
): number {
  if (estado === PrismaInvoiceStatus.BORRADOR || estado === PrismaInvoiceStatus.ANULADA) {
    return 0;
  }

  const pagado = payments.reduce((sum, payment) => sum + payment.monto.toNumber(), 0);
  return total - pagado;
}

function toDateString(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

export type InvoiceListItem = {
  id: string; // slug — identificador público, usado en /invoices/[id]
  numero: string;
  concepto: string;
  fechaEmision: string;
  fechaVencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  saldoPendiente: number;
  estado: InvoiceStatus;
  cliente: {
    nombreComercial: string;
    razonSocial: string;
    cuit: string;
  };
};

const INVOICE_LIST_SELECT = {
  slug: true,
  numero: true,
  concepto: true,
  fechaEmision: true,
  fechaVencimiento: true,
  subtotal: true,
  iva: true,
  total: true,
  estado: true,
  client: { select: { nombreComercial: true, razonSocial: true, cuit: true } },
  payments: { select: { monto: true } },
} as const;

type InvoiceListRow = {
  slug: string;
  numero: string;
  concepto: string;
  fechaEmision: Date | null;
  fechaVencimiento: Date | null;
  subtotal: { toNumber(): number };
  iva: { toNumber(): number };
  total: { toNumber(): number };
  estado: PrismaInvoiceStatus;
  client: { nombreComercial: string; razonSocial: string; cuit: string };
  payments: { monto: { toNumber(): number } }[];
};

function toInvoiceListItem(row: InvoiceListRow): InvoiceListItem {
  const total = row.total.toNumber();

  return {
    id: row.slug,
    numero: row.numero,
    concepto: row.concepto,
    fechaEmision: toDateString(row.fechaEmision),
    fechaVencimiento: toDateString(row.fechaVencimiento),
    subtotal: row.subtotal.toNumber(),
    iva: row.iva.toNumber(),
    total,
    saldoPendiente: computeSaldoPendiente(row.estado, total, row.payments),
    estado: STATUS_TO_DTO[row.estado],
    cliente: {
      nombreComercial: row.client.nombreComercial,
      razonSocial: row.client.razonSocial,
      cuit: row.client.cuit,
    },
  };
}

export type InvoicesSummary = {
  totalFacturado: number;
  pendienteCobro: number;
  vencido: number;
  cobrado: number;
};

// Mismo criterio que summarizeInvoices del mock (mock/invoices.ts), pero
// sobre saldoPendiente ya resuelto acá — no se recalcula en la UI. Vive en
// esta capa (no en InvoicesView) por la regla de arquitectura de Sprint
// 8.6A: ningún componente recalcula totales.
export function summarizeInvoiceList(invoiceList: InvoiceListItem[]): InvoicesSummary {
  return invoiceList.reduce(
    (acc, invoice) => {
      if (invoice.estado !== "borrador" && invoice.estado !== "anulada") {
        acc.totalFacturado += invoice.total;
      }
      if (invoice.estado === "emitida") {
        acc.pendienteCobro += invoice.saldoPendiente;
      }
      if (invoice.estado === "vencida") {
        acc.vencido += invoice.saldoPendiente;
      }
      if (invoice.estado === "pagada") {
        acc.cobrado += invoice.total;
      }
      return acc;
    },
    { totalFacturado: 0, pendienteCobro: 0, vencido: 0, cobrado: 0 }
  );
}

export async function getInvoicesForOrganization(organizationId: string): Promise<InvoiceListItem[]> {
  const rows = await prisma.invoice.findMany({
    where: { organizationId },
    select: INVOICE_LIST_SELECT,
    orderBy: [{ puntoVenta: "asc" }, { numeroSecuencial: "asc" }],
  });

  return rows.map(toInvoiceListItem);
}

export type InvoiceDetail = {
  id: string; // slug
  numero: string;
  concepto: string;
  fechaEmision: string;
  fechaVencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  saldoPendiente: number;
  estado: InvoiceStatus;
  cliente: {
    id: string; // slug del cliente, para linkear a /clients/[id]
    nombreComercial: string;
  };
  // Horas incluidas en esta factura, resueltas vía InvoiceItem.hourEntryId
  // (ver prisma/schema.prisma) — no vía un `hourEntryIds` propio de
  // Invoice, que no existe en el schema (esa relación directa se eliminó a
  // propósito, ver docs/architecture.md).
  hourEntries: HourEntry[];
};

export async function getInvoiceBySlugForOrganization(
  organizationId: string,
  slug: string
): Promise<InvoiceDetail | null> {
  const row = await prisma.invoice.findUnique({
    where: { organizationId_slug: { organizationId, slug } },
    select: {
      numero: true,
      concepto: true,
      fechaEmision: true,
      fechaVencimiento: true,
      subtotal: true,
      iva: true,
      total: true,
      estado: true,
      client: { select: { slug: true, nombreComercial: true } },
      payments: { select: { monto: true } },
      items: { select: { hourEntryId: true } },
    },
  });

  if (!row) return null;

  const total = row.total.toNumber();
  const hourEntryIds = row.items
    .map((item) => item.hourEntryId)
    .filter((id): id is string => id !== null);
  const hourEntries = await getHourEntriesByIds(organizationId, hourEntryIds);

  return {
    id: slug,
    numero: row.numero,
    concepto: row.concepto,
    fechaEmision: toDateString(row.fechaEmision),
    fechaVencimiento: toDateString(row.fechaVencimiento),
    subtotal: row.subtotal.toNumber(),
    iva: row.iva.toNumber(),
    total,
    saldoPendiente: computeSaldoPendiente(row.estado, total, row.payments),
    estado: STATUS_TO_DTO[row.estado],
    cliente: { id: row.client.slug, nombreComercial: row.client.nombreComercial },
    hourEntries,
  };
}
