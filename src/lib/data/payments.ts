import "server-only";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus as PrismaInvoiceStatus, Prisma, type PaymentMethod as PrismaPaymentMethod } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";

// Capa central de acceso a datos de Cobranzas (Sprint 8.7B.1). Mismo patrón
// que src/lib/data/invoices.ts: los componentes visuales (a implementar en
// 8.7B.2) consumirán pagos exclusivamente a través de estas funciones, nunca
// importarán Prisma directamente, y toda query filtra explícitamente por
// organizationId.
//
// Decisión de diseño confirmada en Sprint 8.7A: el saldo pendiente
// (Invoice.total - Σ Payment.monto) es la única fuente de verdad de si una
// factura está saldada. Esta capa NUNCA escribe Invoice.estado — "pagada"
// se deriva del saldo en src/lib/data/invoices.ts (deriveInvoiceStatus), no
// se persiste acá, para no duplicar la fuente de verdad.
//
// Los Payment son registros históricos inmutables en esta primera versión:
// deliberadamente no hay updatePayment ni deletePayment. Cualquier
// reversión de un pago mal cargado queda fuera de alcance de este sprint —
// se resuelve en un sprint específico futuro (acordado en Sprint 8.7A).

export class RegisterPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegisterPaymentError";
  }
}

export type RegisterPaymentInput = {
  monto: number;
  fecha: Date;
  medioPago: PrismaPaymentMethod;
  notas?: string;
};

export type RegisterPaymentResult = {
  paymentId: string;
  saldoPendienteRestante: number;
};

function isFutureDate(fecha: Date): boolean {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return fecha.getTime() > endOfToday.getTime();
}

// Registra un cobro real contra una factura. Toda la validación de negocio
// (estado de la factura, saldo disponible) y la escritura ocurren dentro de
// una única transacción interactiva.
//
// Aislamiento serializable: a diferencia de emitInvoiceFromApprovedHours
// (src/lib/data/invoices.ts), que serializa la concurrencia con un
// updateMany condicionado sobre filas ya existentes (HourEntry), acá no hay
// una fila que condicionar de esa forma — la operación es "sumar los pagos
// existentes y comparar contra el total", un patrón de lectura-agregada y
// luego escritura que READ COMMITTED no protege: dos transacciones
// concurrentes pueden leer el mismo saldo antes de que cualquiera de las
// dos haga commit y ambas insertar un pago válido contra ese saldo ya
// gastado. SERIALIZABLE hace que Postgres aborte una de las dos
// transacciones en conflicto (error P2034 de Prisma), que acá se traduce a
// un mensaje específico pidiendo reintentar — no se reintenta
// automáticamente: quien llama a registerPayment decide si reintenta.
export async function registerPayment(
  organizationId: string,
  invoiceSlug: string,
  input: RegisterPaymentInput
): Promise<RegisterPaymentResult> {
  if (input.monto <= 0) {
    throw new RegisterPaymentError("El importe del pago debe ser mayor a cero.");
  }

  if (isFutureDate(input.fecha)) {
    throw new RegisterPaymentError("La fecha del pago no puede ser una fecha futura.");
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        const invoice = await tx.invoice.findUnique({
          where: { organizationId_slug: { organizationId, slug: invoiceSlug } },
          select: { id: true, estado: true, total: true, payments: { select: { monto: true } } },
        });

        if (!invoice) {
          throw new RegisterPaymentError("La factura no existe en esta organización.");
        }

        if (invoice.estado === PrismaInvoiceStatus.BORRADOR) {
          throw new RegisterPaymentError(
            "No se puede registrar un pago sobre una factura en borrador: todavía no fue emitida."
          );
        }

        if (invoice.estado === PrismaInvoiceStatus.ANULADA) {
          throw new RegisterPaymentError("No se puede registrar un pago sobre una factura anulada.");
        }

        const total = invoice.total.toNumber();
        const pagado = invoice.payments.reduce((sum, payment) => sum + payment.monto.toNumber(), 0);
        const saldoPendiente = total - pagado;

        if (saldoPendiente <= 0) {
          throw new RegisterPaymentError(
            "Esta factura ya está saldada por completo. No se puede registrar un nuevo pago."
          );
        }

        if (input.monto > saldoPendiente) {
          throw new RegisterPaymentError(
            `El importe ingresado (${formatCurrency(input.monto)}) supera el saldo pendiente de la factura (${formatCurrency(saldoPendiente)}).`
          );
        }

        const payment = await tx.payment.create({
          data: {
            organizationId,
            invoiceId: invoice.id,
            monto: input.monto,
            fecha: input.fecha,
            medioPago: input.medioPago,
            notas: input.notas,
          },
        });

        return { paymentId: payment.id, saldoPendienteRestante: saldoPendiente - input.monto };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    if (error instanceof RegisterPaymentError) throw error;

    if (isSerializationConflict(error)) {
      throw new RegisterPaymentError(
        "Otro usuario registró un pago sobre esta factura en este mismo momento. Volvé a intentarlo."
      );
    }

    throw error;
  }
}

// Verificado empíricamente (Sprint 8.7B.1, prueba de concurrencia contra la
// base de desarrollo real): con @prisma/adapter-neon, un conflicto
// SERIALIZABLE de Postgres (SQLSTATE 40001) NO siempre llega envuelto como
// Prisma.PrismaClientKnownRequestError con code "P2034" — en la ruta de
// commit de una transacción interactiva llega como un DriverAdapterError
// "crudo" (paquete interno @prisma/driver-adapter-utils, no es dependencia
// directa del proyecto y no se importa acá) con
// `cause.kind === "TransactionWriteConflict"` / `cause.originalCode ===
// "40001"`. Se chequean ambas formas por duck-typing en vez de un
// `instanceof` contra esa clase interna, para no depender de un paquete que
// pnpm no resuelve como dependencia directa de la aplicación.
function isSerializationConflict(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
    return true;
  }

  const cause = (error as { cause?: { kind?: string; originalCode?: string } } | null | undefined)?.cause;
  return cause?.kind === "TransactionWriteConflict" || cause?.originalCode === "40001";
}

export type PaymentListItem = {
  id: string;
  monto: number;
  fecha: string;
  medioPago: PrismaPaymentMethod;
  notas: string | null;
};

// Historial de pagos de una factura (para el workspace de Facturación en
// 8.7B.2). Se resuelve por slug, no por id interno — igual criterio que el
// resto de esta capa: ningún llamador externo maneja el cuid de Invoice.
// Ordenado por fecha de cobro (no por createdAt): dos pagos cargados el
// mismo día en distinto orden administrativo deben listarse por la fecha
// real del cobro.
export async function getPaymentsForInvoice(organizationId: string, invoiceSlug: string): Promise<PaymentListItem[]> {
  const invoice = await prisma.invoice.findUnique({
    where: { organizationId_slug: { organizationId, slug: invoiceSlug } },
    select: {
      payments: {
        select: { id: true, monto: true, fecha: true, medioPago: true, notas: true },
        orderBy: { fecha: "asc" },
      },
    },
  });

  if (!invoice) return [];

  return invoice.payments.map((payment) => ({
    id: payment.id,
    monto: payment.monto.toNumber(),
    fecha: payment.fecha.toISOString().slice(0, 10),
    medioPago: payment.medioPago,
    notas: payment.notas,
  }));
}
