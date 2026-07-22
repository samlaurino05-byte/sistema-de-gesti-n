"use server";

import { revalidatePath } from "next/cache";
import { SettingsModule, PermissionAction, PaymentMethod } from "@/generated/prisma/client";
import { can } from "@/lib/auth/authorization";
import { requireActiveSession } from "@/lib/auth/session";
import { emitInvoiceFromApprovedHours, EmitInvoiceError } from "@/lib/data/invoices";
import { registerPayment, RegisterPaymentError } from "@/lib/data/payments";
import type { EmitInvoiceState, RegisterPaymentState } from "@/app/(app)/invoices/constants";

// Server Action de la emisión de facturas (Sprint 8.6B.2). Es solamente una
// capa de sesión → permiso → parseo → llamada al data layer → respuesta
// tipada. Toda la lógica de negocio (validar cliente/horas, calcular
// montos, numerar, transacción atómica) vive en
// emitInvoiceFromApprovedHours (src/lib/data/invoices.ts, Sprint 8.6B.1) —
// acá no se repite ni un solo chequeo de negocio.
export async function emitInvoiceAction(
  _prevState: EmitInvoiceState,
  formData: FormData
): Promise<EmitInvoiceState> {
  const session = await requireActiveSession();

  const allowed = await can(session, SettingsModule.FACTURACION, PermissionAction.CREAR);
  if (!allowed) {
    return { status: "error", error: "No tenés permiso para emitir facturas." };
  }

  const clientSlugValue = formData.get("clientSlug");
  const clientSlug = typeof clientSlugValue === "string" ? clientSlugValue : "";
  if (!clientSlug) {
    return { status: "error", error: "Seleccioná un cliente." };
  }

  const hourEntryIds = formData
    .getAll("hourEntryIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (hourEntryIds.length === 0) {
    return { status: "error", error: "Seleccioná al menos una hora para facturar." };
  }

  try {
    const result = await emitInvoiceFromApprovedHours(session.organizationId, clientSlug, hourEntryIds);
    revalidatePath("/invoices");
    return { status: "success", slug: result.slug, numero: result.numero };
  } catch (error) {
    if (error instanceof EmitInvoiceError) {
      return { status: "error", error: error.message };
    }

    // Error inesperado (infraestructura, conexión, etc.): se loguea
    // server-side, pero no se expone el detalle interno al usuario.
    console.error("Error inesperado al emitir factura:", error);
    return { status: "error", error: "No se pudo emitir la factura. Probá de nuevo en unos segundos." };
  }
}

const PAYMENT_METHOD_VALUES: string[] = Object.values(PaymentMethod);

function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHOD_VALUES.includes(value);
}

// Server Action de registro de pagos (Sprint 8.7B.2). Mismo patrón que
// emitInvoiceAction: sesión → permiso → parseo de FormData → llamada al
// data layer → traducción de errores → revalidatePath. Ningún monto, saldo
// ni estado se calcula acá — registerPayment (src/lib/data/payments.ts,
// Sprint 8.7B.1) es la única fuente de esa lógica; acá solo se parsean los
// campos crudos que manda el formulario y se traduce el resultado.
export async function registerPaymentAction(
  _prevState: RegisterPaymentState,
  formData: FormData
): Promise<RegisterPaymentState> {
  const session = await requireActiveSession();

  const allowed = await can(session, SettingsModule.COBRANZAS, PermissionAction.CREAR);
  if (!allowed) {
    return { status: "error", error: "No tenés permiso para registrar pagos." };
  }

  const invoiceSlugValue = formData.get("invoiceSlug");
  const invoiceSlug = typeof invoiceSlugValue === "string" ? invoiceSlugValue : "";
  if (!invoiceSlug) {
    return { status: "error", error: "No se pudo identificar la factura." };
  }

  const montoValue = formData.get("monto");
  const monto = typeof montoValue === "string" ? Number(montoValue) : NaN;
  if (!Number.isFinite(monto) || monto <= 0) {
    return { status: "error", error: "Ingresá un importe numérico mayor a cero." };
  }

  const fechaValue = formData.get("fecha");
  const fechaString = typeof fechaValue === "string" ? fechaValue : "";
  if (!fechaString) {
    return { status: "error", error: "Seleccioná la fecha del pago." };
  }
  const fecha = new Date(fechaString);
  if (Number.isNaN(fecha.getTime())) {
    return { status: "error", error: "La fecha ingresada no es válida." };
  }

  const medioPagoValue = formData.get("medioPago");
  const medioPago = typeof medioPagoValue === "string" ? medioPagoValue : "";
  if (!isPaymentMethod(medioPago)) {
    return { status: "error", error: "Seleccioná un medio de pago válido." };
  }

  const notasValue = formData.get("notas");
  const notas = typeof notasValue === "string" && notasValue.trim().length > 0 ? notasValue.trim() : undefined;

  try {
    await registerPayment(session.organizationId, invoiceSlug, { monto, fecha, medioPago, notas });
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${invoiceSlug}`);
    revalidatePath("/collections");
    return { status: "success" };
  } catch (error) {
    if (error instanceof RegisterPaymentError) {
      return { status: "error", error: error.message };
    }

    // Error inesperado (infraestructura, conexión, etc.): se loguea
    // server-side, pero no se expone el detalle interno al usuario.
    console.error("Error inesperado al registrar pago:", error);
    return { status: "error", error: "No se pudo registrar el pago. Probá de nuevo en unos segundos." };
  }
}
