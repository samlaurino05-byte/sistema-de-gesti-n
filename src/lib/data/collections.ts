import "server-only";
import { prisma } from "@/lib/prisma";
import { getInvoicesForOrganization, type InvoiceListItem } from "@/lib/data/invoices";
import { getClientsForOrganization } from "@/lib/data/clients";
import { formatCurrency } from "@/lib/utils";
import type { CollectionPriority, CollectionStatus, SuggestedChannel } from "@/lib/collectionLabels";

// Re-exportadas para que el resto del código server-side (page.tsx) pueda
// importar tipo + lógica desde un solo lugar. Los componentes cliente
// (CollectionsView, ClientCollectionCard) SIEMPRE deben importar los
// labels (valores en runtime) directo de src/lib/collectionLabels — nunca
// desde acá, que es server-only.
export type { CollectionPriority, CollectionStatus, SuggestedChannel };

// Capa central de acceso a datos del módulo Cobranzas (Sprint 8.7C.1,
// lectura). Mismo patrón que src/lib/data/invoices.ts y payments.ts: los
// componentes visuales consumen Cobranzas exclusivamente a través de estas
// funciones, nunca importan Prisma directamente ni recalculan mora,
// prioridad o saldo.
//
// Decisión de diseño confirmada (Sprint 8.7C): el saldo pendiente de un
// cliente se calcula acá sumando InvoiceListItem.saldoPendiente de sus
// facturas cobrables reales — NUNCA se lee Client.deudaPendiente
// (src/lib/data/clients.ts), que todavía deriva de mock/invoices.ts (ver
// resolveDeudaPendiente) y no es una fuente de verdad confiable para este
// módulo.
//
// Segunda decisión confirmada: el estado financiero de una factura
// (InvoiceStatus: emitida/parcial/vencida, ya resuelto por
// src/lib/data/invoices.ts) y el estado de cobranza (CollectionStatus: al
// día/por vencer/vencida/crítica, definido acá) son dos ejes
// independientes, no un único valor mutuamente excluyente. Un DTO de esta
// capa nunca colapsa uno en el otro — expone ambos por separado
// (`invoice.estado` y `estadoCobranza`) para que la UI los muestre como
// información complementaria.

// ---------------------------------------------------------------------------
// Helpers puros (fecha, severidad, prioridad, canal) — sin Prisma, para que
// tanto el listado completo como el panel de una sola factura
// (getCollectionSeverityForInvoice) compartan exactamente la misma regla.
// ---------------------------------------------------------------------------

function parseLocalDate(dateValue: string): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diffInDays(from: Date, to: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

// Umbrales idénticos a los que ya usaba mock/collections.ts — se migran
// sin cambiar la regla de negocio, solo la fuente de "hoy" (antes una
// fecha congelada de reportes, acá `new Date()` real).
function deriveCollectionStatus(diasMora: number): CollectionStatus {
  if (diasMora > 15) return "critica";
  if (diasMora > 0) return "vencida";
  if (diasMora >= -7) return "por-vencer";
  return "al-dia";
}

function derivePriority(estadoCobranza: CollectionStatus, saldoPendiente: number): CollectionPriority {
  if (estadoCobranza === "critica" || saldoPendiente > 100_000) return "alta";
  if (estadoCobranza === "vencida" || estadoCobranza === "por-vencer") return "media";
  return "baja";
}

function deriveSuggestedChannel(prioridad: CollectionPriority): SuggestedChannel {
  if (prioridad === "alta") return "llamada";
  if (prioridad === "media") return "whatsapp";
  return "email";
}

export type CollectionSeverity = {
  diasMora: number;
  estadoCobranza: CollectionStatus;
  prioridad: CollectionPriority;
  canalSugerido: SuggestedChannel;
};

function computeSeverity(fechaVencimiento: string, saldoPendiente: number, hoy: Date): CollectionSeverity {
  const vencimiento = parseLocalDate(fechaVencimiento);
  const diasMora = diffInDays(vencimiento, hoy);
  const estadoCobranza = deriveCollectionStatus(diasMora);
  const prioridad = derivePriority(estadoCobranza, saldoPendiente);
  const canalSugerido = deriveSuggestedChannel(prioridad);
  return { diasMora, estadoCobranza, prioridad, canalSugerido };
}

// Facturas candidatas a cobranza: excluye pagada/anulada/borrador. No
// duplica deriveInvoiceStatus (privada de invoices.ts) — opera sobre el
// InvoiceStatus ya resuelto por getInvoicesForOrganization.
function isCollectable(estado: InvoiceListItem["estado"]): boolean {
  return estado === "emitida" || estado === "parcial" || estado === "vencida";
}

// ---------------------------------------------------------------------------
// CollectionFollowUp — solo lectura en 8.7C.1. La escritura (marcar
// seguimiento, asignar responsable, registrar canal/fecha de contacto)
// queda para 8.7C.2.
// ---------------------------------------------------------------------------

export type CollectionFollowUpInfo = {
  enSeguimiento: boolean;
  notas: string | null;
  canalUtilizado: string | null; // label ya resuelto ("Llamada telefónica"/"WhatsApp"/"Email"), o null si nunca se registró contacto
  fechaUltimoContacto: string | null;
  asignadoA: string | null; // nombre del empleado asignado, ya resuelto
};

const SIN_SEGUIMIENTO: CollectionFollowUpInfo = {
  enSeguimiento: false,
  notas: null,
  canalUtilizado: null,
  fechaUltimoContacto: null,
  asignadoA: null,
};

const CANAL_UTILIZADO_LABELS: Record<string, string> = {
  LLAMADA: "Llamada telefónica",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
};

// Consulta independiente de getInvoicesForOrganization (que no conoce
// CollectionFollowUp — es una relación propia de Cobranzas, no de
// Facturación). Se resuelve por slug, no por id interno de Invoice: ningún
// DTO de esta capa expone ese cuid.
async function getFollowUpsBySlug(
  organizationId: string,
  invoiceSlugs: string[]
): Promise<Map<string, CollectionFollowUpInfo>> {
  if (invoiceSlugs.length === 0) return new Map();

  const rows = await prisma.invoice.findMany({
    where: { organizationId, slug: { in: invoiceSlugs } },
    select: {
      slug: true,
      collectionFollowUp: {
        select: {
          enSeguimiento: true,
          notas: true,
          canalUtilizado: true,
          fechaUltimoContacto: true,
          asignadoA: { select: { nombre: true } },
        },
      },
    },
  });

  const followUpsBySlug = new Map<string, CollectionFollowUpInfo>();
  for (const row of rows) {
    const followUp = row.collectionFollowUp;
    followUpsBySlug.set(
      row.slug,
      followUp
        ? {
            enSeguimiento: followUp.enSeguimiento,
            notas: followUp.notas,
            canalUtilizado: followUp.canalUtilizado ? CANAL_UTILIZADO_LABELS[followUp.canalUtilizado] : null,
            fechaUltimoContacto: followUp.fechaUltimoContacto
              ? followUp.fechaUltimoContacto.toISOString().slice(0, 10)
              : null,
            asignadoA: followUp.asignadoA?.nombre ?? null,
          }
        : SIN_SEGUIMIENTO
    );
  }
  return followUpsBySlug;
}

// ---------------------------------------------------------------------------
// Listado completo (/collections)
// ---------------------------------------------------------------------------

export type CollectionInvoiceItem = CollectionSeverity & {
  invoice: InvoiceListItem;
  followUp: CollectionFollowUpInfo;
};

export async function getCollectionItemsForOrganization(organizationId: string): Promise<CollectionInvoiceItem[]> {
  const invoices = await getInvoicesForOrganization(organizationId);
  const collectableInvoices = invoices.filter((invoice) => isCollectable(invoice.estado));

  const followUpsBySlug = await getFollowUpsBySlug(
    organizationId,
    collectableInvoices.map((invoice) => invoice.id)
  );

  const hoy = new Date();

  return collectableInvoices
    .map((invoice) => ({
      invoice,
      ...computeSeverity(invoice.fechaVencimiento, invoice.saldoPendiente, hoy),
      followUp: followUpsBySlug.get(invoice.id) ?? SIN_SEGUIMIENTO,
    }))
    .sort((a, b) => b.diasMora - a.diasMora);
}

export type ClientCollectionGroup = {
  client: {
    id: string;
    nombreComercial: string;
    razonSocial: string;
    cuit: string;
    responsableInterno: string;
    estado: string; // ClientStatus del DTO real (data/clients.ts), en español ("activo"/"mora"/...)
  };
  items: CollectionInvoiceItem[];
  totalPendiente: number;
  peorEstadoCobranza: CollectionStatus;
  prioridad: CollectionPriority;
  diasMoraMax: number;
  tieneSeguimientoActivo: boolean;
};

const COLLECTION_STATUS_SEVERITY: Record<CollectionStatus, number> = {
  "al-dia": 0,
  "por-vencer": 1,
  vencida: 2,
  critica: 3,
};

const PRIORITY_SEVERITY: Record<CollectionPriority, number> = { baja: 0, media: 1, alta: 2 };

function groupItemsByClient(
  items: CollectionInvoiceItem[],
  clientInfoBySlug: Map<string, { nombreComercial: string; razonSocial: string; cuit: string; responsableInterno: string; estado: string }>
): ClientCollectionGroup[] {
  const itemsByClientSlug = new Map<string, CollectionInvoiceItem[]>();

  for (const item of items) {
    const clientSlug = item.invoice.cliente.id;
    const list = itemsByClientSlug.get(clientSlug) ?? [];
    list.push(item);
    itemsByClientSlug.set(clientSlug, list);
  }

  const groups: ClientCollectionGroup[] = [];

  for (const [clientSlug, groupItems] of itemsByClientSlug) {
    const clientInfo = clientInfoBySlug.get(clientSlug);
    // No debería pasar (todo InvoiceListItem viene de un Client real de la
    // misma organización), pero si el cliente fuera borrado entre queries,
    // se excluye el grupo en vez de mostrar datos inventados.
    if (!clientInfo) continue;

    const totalPendiente = groupItems.reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);
    const peorEstadoCobranza = groupItems.reduce<CollectionStatus>(
      (worst, item) => (COLLECTION_STATUS_SEVERITY[item.estadoCobranza] > COLLECTION_STATUS_SEVERITY[worst] ? item.estadoCobranza : worst),
      "al-dia"
    );
    const prioridad = groupItems.reduce<CollectionPriority>(
      (worst, item) => (PRIORITY_SEVERITY[item.prioridad] > PRIORITY_SEVERITY[worst] ? item.prioridad : worst),
      "baja"
    );
    const diasMoraMax = Math.max(...groupItems.map((item) => item.diasMora));
    const tieneSeguimientoActivo = groupItems.some((item) => item.followUp.enSeguimiento);

    groups.push({
      client: { id: clientSlug, ...clientInfo },
      items: groupItems,
      totalPendiente,
      peorEstadoCobranza,
      prioridad,
      diasMoraMax,
      tieneSeguimientoActivo,
    });
  }

  return groups.sort((a, b) => b.totalPendiente - a.totalPendiente);
}

// Función principal para /collections: resuelve facturas cobrables +
// CollectionFollowUp + datos de cliente (SIN leer Client.deudaPendiente) y
// devuelve los grupos ya armados. La UI no vuelve a agrupar ni a sumar
// nada — ver CollectionsView.
export async function getCollectionsForOrganization(organizationId: string): Promise<ClientCollectionGroup[]> {
  const [items, clients] = await Promise.all([
    getCollectionItemsForOrganization(organizationId),
    getClientsForOrganization(organizationId),
  ]);

  const clientInfoBySlug = new Map(
    clients.map((client) => [
      client.id,
      {
        nombreComercial: client.nombreComercial,
        razonSocial: client.razonSocial,
        cuit: client.cuit,
        responsableInterno: client.responsableInterno,
        estado: client.estado,
      },
    ])
  );

  return groupItemsByClient(items, clientInfoBySlug);
}

// Para el panel "Estado de cobranza" del workspace de una factura
// individual (src/app/(app)/invoices/[id]/page.tsx) — evita traer todo el
// listado de la organización solo para mostrar una factura. Comparte
// computeSeverity/isCollectable con el listado completo: ninguna regla se
// duplica.
export async function getCollectionSeverityForInvoice(
  invoice: Pick<InvoiceListItem, "estado" | "fechaVencimiento" | "saldoPendiente">
): Promise<CollectionSeverity | null> {
  if (!isCollectable(invoice.estado)) return null;
  return computeSeverity(invoice.fechaVencimiento, invoice.saldoPendiente, new Date());
}

// ---------------------------------------------------------------------------
// Resúmenes para /collections (tarjetas de métricas + panel de IA)
// ---------------------------------------------------------------------------

export type CollectionsSummary = {
  totalPendiente: number;
  vencido: number;
  porVencer: number;
  cobradoEsteMes: number;
};

function summarizeItems(items: CollectionInvoiceItem[]): Omit<CollectionsSummary, "cobradoEsteMes"> {
  const totalPendiente = items.reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);
  const vencido = items
    .filter((item) => item.diasMora > 0)
    .reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);
  const porVencer = items
    .filter((item) => item.diasMora <= 0 && item.diasMora >= -7)
    .reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);

  return { totalPendiente, vencido, porVencer };
}

// "Cobrado este mes": a diferencia del mock (que usaba
// Invoice.fechaVencimiento del mes en curso como proxy), acá se suma
// Payment.monto real filtrado por Payment.fecha — el dato correcto una vez
// que existen pagos reales (Sprint 8.7B.1). Única función de este archivo
// que consulta Payment en vez de reusar InvoiceListItem, porque
// InvoiceListItem no expone fechas de pago individuales.
async function getCobradoEsteMes(organizationId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const payments = await prisma.payment.findMany({
    where: { organizationId, fecha: { gte: startOfMonth, lt: startOfNextMonth } },
    select: { monto: true },
  });

  return payments.reduce((sum, payment) => sum + payment.monto.toNumber(), 0);
}

export async function getCollectionsSummaryForOrganization(organizationId: string): Promise<CollectionsSummary> {
  const [items, cobradoEsteMes] = await Promise.all([
    getCollectionItemsForOrganization(organizationId),
    getCobradoEsteMes(organizationId),
  ]);

  return { ...summarizeItems(items), cobradoEsteMes };
}

export type CollectionsDailySummary = {
  clientes: number;
  criticas: number;
  porVencer: number;
  enSeguimiento: number;
};

// Cuenta CLIENTES (no facturas) en cada categoría — mismo criterio que el
// mock: un cliente con dos facturas críticas cuenta una vez.
export function summarizeCollectionsDaily(groups: ClientCollectionGroup[]): CollectionsDailySummary {
  const criticas = groups.filter((group) => group.items.some((item) => item.estadoCobranza === "critica")).length;
  const porVencer = groups.filter((group) => group.items.some((item) => item.estadoCobranza === "por-vencer")).length;
  const enSeguimiento = groups.filter((group) => group.tieneSeguimientoActivo).length;

  return { clientes: groups.length, criticas, porVencer, enSeguimiento };
}

// Mismo criterio de negocio que getCollectionsAiInsights del mock, ahora
// sobre ClientCollectionGroup[] real. `estado` del cliente viene del DTO
// real de data/clients.ts (Prisma), no de mock/clients.ts.
export function getCollectionsAiInsights(groups: ClientCollectionGroup[]): string[] {
  const insights: string[] = [];

  const prioritarios = groups.filter((group) => group.prioridad === "alta").sort((a, b) => b.totalPendiente - a.totalPendiente);
  if (prioritarios.length > 0) {
    const nombres = prioritarios.slice(0, 2).map((group) => group.client.nombreComercial).join(" y ");
    const total = prioritarios.reduce((sum, group) => sum + group.totalPendiente, 0);
    insights.push(`${nombres} requieren gestión inmediata: concentran ${formatCurrency(total)} en cuentas de prioridad alta.`);
  }

  const riesgoIncobrable = groups.filter((group) => group.client.estado === "mora" && group.diasMoraMax > 15);
  if (riesgoIncobrable.length > 0) {
    const nombres = riesgoIncobrable.map((group) => group.client.nombreComercial).join(", ");
    insights.push(`Riesgo de incobrabilidad en ${nombres}: la cuenta ya está en mora y supera los 15 días de atraso.`);
  }

  const enSeguimiento = groups.filter((group) => group.tieneSeguimientoActivo);
  if (enSeguimiento.length > 0) {
    const nombres = enSeguimiento.map((group) => group.client.nombreComercial).join(", ");
    insights.push(`${nombres} ya están en seguimiento activo. Confirmá la promesa de pago antes de escalar el reclamo.`);
  }

  const porVencer = groups.filter((group) => group.peorEstadoCobranza === "por-vencer");
  if (porVencer.length > 0) {
    insights.push(
      `${porVencer.length} cliente(s) tienen facturas por vencer esta semana. Un recordatorio preventivo evita que pasen a mora.`
    );
  }

  if (groups.length === 0) {
    insights.push("No hay facturas pendientes de cobro en este momento. La cartera está al día.");
  }

  return insights;
}
