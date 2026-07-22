import { getClientById, type Client } from "@/lib/mock/clients";
import { isWithinReportPeriod, parseLocalDate, REPORTS_REFERENCE_DATE } from "@/lib/mock/reports";
import type { Invoice } from "@/lib/mock/invoices";
import { formatCurrency } from "@/lib/utils";

export type CollectionStatus = "al-dia" | "por-vencer" | "vencida" | "critica" | "en-seguimiento";

export const collectionStatusLabels: Record<CollectionStatus, string> = {
  "al-dia": "Al día",
  "por-vencer": "Por vencer",
  vencida: "Vencida",
  critica: "Crítica",
  "en-seguimiento": "En seguimiento",
};

export type CollectionPriority = "alta" | "media" | "baja";

export const collectionPriorityLabels: Record<CollectionPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export type SuggestedChannel = "llamada" | "whatsapp" | "email";

export const suggestedChannelLabels: Record<SuggestedChannel, string> = {
  llamada: "Llamada telefónica",
  whatsapp: "WhatsApp",
  email: "Email",
};

// Invoices already being chased manually — the display status shows "En
// seguimiento" instead of the raw aging bucket, but priority/channel keep
// reflecting the real underlying severity so nothing gets silently buried.
const FOLLOW_UP_INVOICE_IDS = new Set(["inv-distribuidora-norte-01", "inv-ferreteria-union-01"]);

function diffInDays(from: Date, to: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export type CollectionInvoice = {
  invoice: Invoice;
  client: Client;
  diasMora: number;
  estadoCobranza: CollectionStatus;
  prioridad: CollectionPriority;
  canalSugerido: SuggestedChannel;
};

function enrichInvoice(invoice: Invoice): CollectionInvoice | null {
  if (invoice.saldoPendiente <= 0) return null;
  // Sprint 8.7B.2: "parcial" (saldoPendiente > 0 pero menor al total) sigue
  // teniendo saldo por cobrar — debe seguir apareciendo en gestión de
  // cobranza igual que "emitida"/"vencida". Ver deriveInvoiceStatus en
  // src/lib/data/invoices.ts.
  if (invoice.estado !== "emitida" && invoice.estado !== "vencida" && invoice.estado !== "parcial") return null;

  const client = getClientById(invoice.clientId);
  if (!client) return null;

  const vencimiento = parseLocalDate(invoice.fechaVencimiento);
  const diasMora = diffInDays(vencimiento, REPORTS_REFERENCE_DATE);

  let severidad: CollectionStatus;
  if (diasMora > 15) severidad = "critica";
  else if (diasMora > 0) severidad = "vencida";
  else if (diasMora >= -7) severidad = "por-vencer";
  else severidad = "al-dia";

  const estadoCobranza: CollectionStatus = FOLLOW_UP_INVOICE_IDS.has(invoice.id) ? "en-seguimiento" : severidad;

  let prioridad: CollectionPriority;
  if (severidad === "critica" || invoice.saldoPendiente > 100000) prioridad = "alta";
  else if (severidad === "vencida" || severidad === "por-vencer") prioridad = "media";
  else prioridad = "baja";

  let canalSugerido: SuggestedChannel;
  if (prioridad === "alta") canalSugerido = "llamada";
  else if (prioridad === "media") canalSugerido = "whatsapp";
  else canalSugerido = "email";

  return { invoice, client, diasMora, estadoCobranza, prioridad, canalSugerido };
}

export function getCollectionInvoices(invoiceList: Invoice[]): CollectionInvoice[] {
  return invoiceList
    .map(enrichInvoice)
    .filter((item): item is CollectionInvoice => item !== null)
    .sort((a, b) => b.diasMora - a.diasMora);
}

export function getCollectionForInvoice(invoice: Invoice): CollectionInvoice | null {
  return enrichInvoice(invoice);
}

export type ClientCollectionGroup = {
  client: Client;
  items: CollectionInvoice[];
  totalPendiente: number;
  peorEstado: CollectionStatus;
  prioridad: CollectionPriority;
  diasMoraMax: number;
};

const statusSeverity: Record<CollectionStatus, number> = {
  "al-dia": 0,
  "por-vencer": 1,
  "en-seguimiento": 2,
  vencida: 3,
  critica: 4,
};

const prioritySeverity: Record<CollectionPriority, number> = { baja: 0, media: 1, alta: 2 };

export function groupCollectionsByClient(items: CollectionInvoice[]): ClientCollectionGroup[] {
  const byClient = new Map<string, CollectionInvoice[]>();

  for (const item of items) {
    const list = byClient.get(item.client.id) ?? [];
    list.push(item);
    byClient.set(item.client.id, list);
  }

  const groups: ClientCollectionGroup[] = [];

  for (const groupItems of byClient.values()) {
    const client = groupItems[0].client;
    const totalPendiente = groupItems.reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);
    const peorEstado = groupItems.reduce<CollectionStatus>(
      (worst, item) => (statusSeverity[item.estadoCobranza] > statusSeverity[worst] ? item.estadoCobranza : worst),
      "al-dia"
    );
    const prioridad = groupItems.reduce<CollectionPriority>(
      (worst, item) => (prioritySeverity[item.prioridad] > prioritySeverity[worst] ? item.prioridad : worst),
      "baja"
    );
    const diasMoraMax = Math.max(...groupItems.map((item) => item.diasMora));

    groups.push({ client, items: groupItems, totalPendiente, peorEstado, prioridad, diasMoraMax });
  }

  return groups.sort((a, b) => b.totalPendiente - a.totalPendiente);
}

export function getClientCollectionGroups(invoiceList: Invoice[]): ClientCollectionGroup[] {
  return groupCollectionsByClient(getCollectionInvoices(invoiceList));
}

export function getCollectionSummaryForClient(clientId: string, invoiceList: Invoice[]): ClientCollectionGroup | null {
  return getClientCollectionGroups(invoiceList).find((group) => group.client.id === clientId) ?? null;
}

export function getCollectionsSummary(invoiceList: Invoice[]) {
  const items = getCollectionInvoices(invoiceList);

  const totalPendiente = items.reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);
  const vencido = items.filter((item) => item.diasMora > 0).reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);
  const porVencer = items
    .filter((item) => item.diasMora <= 0 && item.diasMora >= -7)
    .reduce((sum, item) => sum + item.invoice.saldoPendiente, 0);

  const cobradoEsteMes = invoiceList
    .filter((invoice) => invoice.estado === "pagada" && isWithinReportPeriod(invoice.fechaVencimiento, "mes"))
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return { totalPendiente, vencido, porVencer, cobradoEsteMes };
}

// Counts by underlying severity (days overdue), not the display status — a
// critical invoice already "en seguimiento" still needs to show up here, or
// it silently disappears from the day's risk count while the AI panel keeps
// flagging it.
export function getCollectionsDailySummary(invoiceList: Invoice[]) {
  const items = getCollectionInvoices(invoiceList);
  const groups = groupCollectionsByClient(items);

  const clientesCriticos = new Set(items.filter((item) => item.diasMora > 15).map((item) => item.client.id));
  const clientesPorVencer = new Set(
    items.filter((item) => item.diasMora <= 0 && item.diasMora >= -7).map((item) => item.client.id)
  );
  const clientesEnSeguimiento = new Set(
    items.filter((item) => item.estadoCobranza === "en-seguimiento").map((item) => item.client.id)
  );

  return {
    clientes: groups.length,
    criticas: clientesCriticos.size,
    porVencer: clientesPorVencer.size,
    enSeguimiento: clientesEnSeguimiento.size,
  };
}

export function getCollectionsAiInsights(invoiceList: Invoice[]): string[] {
  const groups = getClientCollectionGroups(invoiceList);
  const insights: string[] = [];

  const prioritarios = groups
    .filter((group) => group.prioridad === "alta")
    .sort((a, b) => b.totalPendiente - a.totalPendiente);
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

  const enSeguimiento = groups.filter((group) => group.items.some((item) => item.estadoCobranza === "en-seguimiento"));
  if (enSeguimiento.length > 0) {
    const nombres = enSeguimiento.map((group) => group.client.nombreComercial).join(", ");
    insights.push(`${nombres} ya están en seguimiento activo. Confirmá la promesa de pago antes de escalar el reclamo.`);
  }

  const porVencer = groups.filter((group) => group.peorEstado === "por-vencer");
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
