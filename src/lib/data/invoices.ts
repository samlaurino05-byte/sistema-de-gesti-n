import "server-only";
import { prisma } from "@/lib/prisma";
import {
  ClientStatus as PrismaClientStatus,
  HourEntryStatus as PrismaHourEntryStatus,
  InvoiceStatus as PrismaInvoiceStatus,
} from "@/generated/prisma/client";
import { calculateInvoiceAmounts, type InvoiceStatus } from "@/lib/mock/invoices";
import { getHourEntriesByIds, getHourEntriesForOrganization } from "@/lib/data/hours";
import type { HourEntry } from "@/lib/mock/hours";

// Capa central de acceso a datos del módulo Facturación (Sprint 8.6A lectura,
// 8.6B emisión). Mismo patrón que src/lib/data/clients.ts, employees.ts y
// hours.ts: los componentes visuales consumen facturas exclusivamente a
// través de estas funciones, nunca importan Prisma directamente, y toda
// query filtra explícitamente por organizationId (que debe salir de la
// sesión activa, ver src/lib/auth/session.ts).
//
// Regla de arquitectura (Sprint 8.6A): toda la lógica de negocio de
// Facturación — resolución de cliente, cálculo de saldo pendiente, mapeo de
// estado — vive acá, no en páginas ni componentes. Los DTOs que exponen
// estas funciones ya traen resuelto todo lo que la UI necesita; ningún
// componente debería volver a calcular saldo/estado/cliente/pagos/totales.
// Sprint 8.6B extiende esta misma regla a la emisión: la transacción
// completa (validación, numeración, cálculo de montos) vive acá, no en la
// Server Action ni en el componente que la invoque (8.6B.2, todavía no
// implementado).

// Sprint 8.7A/8.7B.1: el saldo pendiente es la única fuente de verdad de si
// una factura está saldada. El valor crudo de Invoice.estado en la base
// solo distingue las transiciones de workflow que no son derivables del
// saldo (BORRADOR → EMITIDA al emitir, ANULADA al anular manualmente).
// "Pagada", "parcial" y "vencida" nunca se leen del valor crudo de la
// columna ni se persisten en ningún lado — Cobranzas
// (src/lib/data/payments.ts) tampoco los escribe, para no mantener dos
// fuentes de verdad del mismo hecho.
function isPastDueDate(fechaVencimiento: Date | null): boolean {
  if (!fechaVencimiento) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return fechaVencimiento.getTime() < startOfToday.getTime();
}

// Sprint 8.7B.2: "parcial" se agrega acá, no como un valor nuevo de
// PrismaInvoiceStatus (eso requeriría migración de schema) — se deriva
// exclusivamente de `total`/`saldoPendiente`, los mismos dos campos que ya
// resuelve esta capa. Va inmediatamente después de "pagada" y antes de
// "vencida": un pago parcial es la información más específica y relevante
// (prevalece incluso si la factura además está vencida — la regla acordada
// no distingue esos dos casos, solo si `0 < saldoPendiente < total`).
function deriveInvoiceStatus(
  estado: PrismaInvoiceStatus,
  saldoPendiente: number,
  total: number,
  fechaVencimiento: Date | null
): InvoiceStatus {
  if (estado === PrismaInvoiceStatus.BORRADOR) return "borrador";
  if (estado === PrismaInvoiceStatus.ANULADA) return "anulada";
  if (saldoPendiente <= 0) return "pagada";
  if (saldoPendiente < total) return "parcial";
  if (isPastDueDate(fechaVencimiento)) return "vencida";
  return "emitida";
}

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
    // Sprint 8.7C.1: `id` (slug del cliente) se agrega acá para que
    // Cobranzas pueda agrupar por cliente de forma confiable (dos clientes
    // podrían compartir nombre comercial) y armar los links a
    // /clients/[id] sin tener que resolverlo aparte. Aditivo — ningún
    // consumidor existente de InvoiceListItem se ve afectado.
    id: string;
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
  client: { select: { slug: true, nombreComercial: true, razonSocial: true, cuit: true } },
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
  client: { slug: string; nombreComercial: string; razonSocial: string; cuit: string };
  payments: { monto: { toNumber(): number } }[];
};

function toInvoiceListItem(row: InvoiceListRow): InvoiceListItem {
  const total = row.total.toNumber();
  const saldoPendiente = computeSaldoPendiente(row.estado, total, row.payments);

  return {
    id: row.slug,
    numero: row.numero,
    concepto: row.concepto,
    fechaEmision: toDateString(row.fechaEmision),
    fechaVencimiento: toDateString(row.fechaVencimiento),
    subtotal: row.subtotal.toNumber(),
    iva: row.iva.toNumber(),
    total,
    saldoPendiente,
    estado: deriveInvoiceStatus(row.estado, saldoPendiente, total, row.fechaVencimiento),
    cliente: {
      id: row.client.slug,
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
      // Sprint 8.7B.2: "parcial" también tiene saldo pendiente de cobro —
      // sin este caso, una factura con pago parcial dejaría de sumar acá
      // apenas deja de ser "emitida" (regresión directa de agregar
      // "parcial" a InvoiceStatus, no un ajuste opcional).
      if (invoice.estado === "emitida" || invoice.estado === "parcial") {
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
  const saldoPendiente = computeSaldoPendiente(row.estado, total, row.payments);
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
    saldoPendiente,
    estado: deriveInvoiceStatus(row.estado, saldoPendiente, total, row.fechaVencimiento),
    cliente: { id: row.client.slug, nombreComercial: row.client.nombreComercial },
    hourEntries,
  };
}

// Horas elegibles para incluir en una factura nueva (Sprint 8.6B.2): mismo
// criterio que exige emitInvoiceFromApprovedHours (estado APROBADA). Se
// centraliza acá — no en la Server Action ni en el componente — para que
// "qué horas se pueden facturar" tenga una única definición en todo el
// módulo. La UI filtra el resultado por cliente seleccionado (una elección
// de presentación, no una regla de negocio nueva).
export async function getBillableHourEntriesForOrganization(organizationId: string): Promise<HourEntry[]> {
  const hourEntries = await getHourEntriesForOrganization(organizationId);
  return hourEntries.filter((entry) => entry.estado === "aprobada");
}

// ---------------------------------------------------------------------------
// Emisión real de facturas (Sprint 8.6B.1)
// ---------------------------------------------------------------------------
//
// Decisiones de negocio confirmadas para este sprint (no son valores
// arbitrarios — quedan documentadas acá porque dependen de módulos que
// todavía no migraron):
// - Punto de venta y días de vencimiento: constantes, hasta que
//   BillingSettings (Configuración → Facturación) se migre a Prisma.
// - Concepto: fijo ("Honorarios profesionales"), sin generación automática
//   de nombres de proyecto ni período en este sprint.
// - Letra del comprobante: derivada de Client.condicionFiscal. Si el valor
//   no matchea ninguna condición conocida, se rechaza la emisión en vez de
//   asumir una letra por defecto.
// - Clientes facturables: solo ACTIVO y MORA. PAUSADO e INACTIVO bloquean
//   la emisión.
// - Estado inicial de la factura: EMITIDA (no BORRADOR).
const PUNTO_VENTA = "0003";
const DIAS_VENCIMIENTO = 30;
const CONCEPTO_POR_DEFECTO = "Honorarios profesionales";
const ALICUOTA_IVA = 21;

const CLIENT_ESTADOS_FACTURABLES: PrismaClientStatus[] = [PrismaClientStatus.ACTIVO, PrismaClientStatus.MORA];

const LETRA_COMPROBANTE_POR_CONDICION_FISCAL: Record<string, string> = {
  "Responsable Inscripto": "A",
  Monotributo: "B",
};

// Todos los errores de negocio de la emisión (a diferencia de errores de
// infraestructura: caída de conexión, etc.) se tipan con esta clase, para
// que la Server Action de 8.6B.2 pueda distinguir "mostrale este mensaje al
// usuario" de "esto es un error inesperado, logueá y mostrá un genérico".
export class EmitInvoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmitInvoiceError";
  }
}

export type EmitInvoiceResult = {
  slug: string;
  numero: string;
};

function buildInvoiceNumero(letra: string, numeroSecuencial: number): string {
  return `${letra} ${PUNTO_VENTA}-${String(numeroSecuencial).padStart(5, "0")}`;
}

function slugifyNumero(numero: string): string {
  return numero.toLowerCase().replace(/\s+/g, "-");
}

// Emite una factura real a partir de horas ya aprobadas. Toda la
// validación, el cálculo de montos y la numeración ocurren dentro de una
// única transacción interactiva — ver docs/architecture.md y el diseño de
// Sprint 8.6B para el detalle de por qué cada paso está en este orden.
//
// `clientSlug`/`hourEntryIds` son los únicos datos que deberían venir del
// llamador: ningún monto (subtotal/iva/total) se acepta como input — se
// recalculan acá desde las HourEntry ya validadas, para que no exista
// ninguna vía de mandar un total manipulado desde afuera.
export async function emitInvoiceFromApprovedHours(
  organizationId: string,
  clientSlug: string,
  hourEntryIds: string[]
): Promise<EmitInvoiceResult> {
  if (hourEntryIds.length === 0) {
    throw new EmitInvoiceError("Seleccioná al menos una hora para facturar.");
  }

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({
      where: { organizationId_slug: { organizationId, slug: clientSlug } },
      select: { id: true, condicionFiscal: true, estado: true },
    });

    if (!client) {
      throw new EmitInvoiceError("El cliente no existe en esta organización.");
    }

    if (!CLIENT_ESTADOS_FACTURABLES.includes(client.estado)) {
      throw new EmitInvoiceError("No se puede facturar a un cliente pausado o inactivo.");
    }

    const letra = LETRA_COMPROBANTE_POR_CONDICION_FISCAL[client.condicionFiscal];
    if (!letra) {
      throw new EmitInvoiceError(
        `No se pudo determinar el tipo de comprobante para la condición fiscal "${client.condicionFiscal}".`
      );
    }

    // Primera verificación: trae las horas con sus valores snapshot para
    // calcular los montos. El propio filtro `estado: APROBADA` ya excluye
    // horas ya facturadas por otra transacción — si `hourEntries.length` no
    // coincide con lo pedido, algo cambió desde que el usuario armó la
    // selección (no pertenece al cliente, ya no está aprobada, no existe).
    const hourEntries = await tx.hourEntry.findMany({
      where: {
        id: { in: hourEntryIds },
        organizationId,
        clientId: client.id,
        estado: PrismaHourEntryStatus.APROBADA,
      },
      select: { id: true, proyecto: true, horas: true, valorHoraCliente: true },
    });

    if (hourEntries.length !== hourEntryIds.length) {
      throw new EmitInvoiceError(
        "Alguna de las horas seleccionadas ya no está disponible (fue facturada, rechazada, o no pertenece a este cliente). Volvé a revisar la selección."
      );
    }

    const items = hourEntries.map((entry) => {
      const cantidad = entry.horas.toNumber();
      const precioUnitario = entry.valorHoraCliente.toNumber();
      const subtotalItem = cantidad * precioUnitario;
      const { iva: montoIva, total: totalItem } = calculateInvoiceAmounts(subtotalItem);

      return {
        hourEntryId: entry.id,
        descripcion: entry.proyecto,
        cantidad,
        precioUnitario,
        subtotal: subtotalItem,
        montoIva,
        total: totalItem,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const { iva, total } = calculateInvoiceAmounts(subtotal);

    // Segunda verificación — la que realmente protege contra concurrencia:
    // un UPDATE condicionado por `estado: APROBADA` solo afecta las filas
    // que siguen aprobadas en este instante. Si otra transacción ya las
    // facturó entre el SELECT de arriba y este UPDATE, `count` viene menor
    // y se aborta sin haber tocado el contador ni creado nada.
    const { count: horasFacturadasCount } = await tx.hourEntry.updateMany({
      where: {
        id: { in: hourEntryIds },
        organizationId,
        clientId: client.id,
        estado: PrismaHourEntryStatus.APROBADA,
      },
      data: { estado: PrismaHourEntryStatus.FACTURADA },
    });

    if (horasFacturadasCount !== hourEntryIds.length) {
      throw new EmitInvoiceError(
        "Alguna de las horas seleccionadas fue facturada por otra persona en este momento. Volvé a intentarlo."
      );
    }

    // Incremento atómico del contador (ver docs/architecture.md e
    // InvoiceCounter en prisma/schema.prisma): `upsert` para autocrear el
    // contador si es la primera factura de este punto de venta.
    const counter = await tx.invoiceCounter.upsert({
      where: { organizationId_puntoVenta: { organizationId, puntoVenta: PUNTO_VENTA } },
      update: { lastNumber: { increment: 1 } },
      create: { organizationId, puntoVenta: PUNTO_VENTA, lastNumber: 1 },
    });

    const numeroSecuencial = counter.lastNumber;
    const numero = buildInvoiceNumero(letra, numeroSecuencial);
    const slug = slugifyNumero(numero);

    const fechaEmision = new Date();
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + DIAS_VENCIMIENTO);

    const invoice = await tx.invoice.create({
      data: {
        organizationId,
        clientId: client.id,
        slug,
        puntoVenta: PUNTO_VENTA,
        numeroSecuencial,
        numero,
        concepto: CONCEPTO_POR_DEFECTO,
        fechaEmision,
        fechaVencimiento,
        subtotal,
        iva,
        total,
        estado: PrismaInvoiceStatus.EMITIDA,
      },
    });

    await tx.invoiceItem.createMany({
      data: items.map((item, index) => ({
        organizationId,
        invoiceId: invoice.id,
        orden: index + 1,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        alicuotaIva: ALICUOTA_IVA,
        subtotal: item.subtotal,
        montoIva: item.montoIva,
        total: item.total,
        hourEntryId: item.hourEntryId,
      })),
    });

    return { slug, numero };
  });
}
