"use server";

import { revalidatePath } from "next/cache";
import { SettingsModule, PermissionAction } from "@/generated/prisma/client";
import { can } from "@/lib/auth/authorization";
import { requireActiveSession } from "@/lib/auth/session";
import { emitInvoiceFromApprovedHours, EmitInvoiceError } from "@/lib/data/invoices";
import type { EmitInvoiceState } from "@/app/(app)/invoices/constants";

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
