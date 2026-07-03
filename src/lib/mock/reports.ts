import { clients, getClientById, type Client } from "@/lib/mock/clients";
import { getEmployeeById, type Employee } from "@/lib/mock/employees";
import {
  getHourEntryMetrics,
  getProductivityRate,
  summarizeHours,
  type HourEntry,
} from "@/lib/mock/hours";
import { summarizeInvoices, type Invoice } from "@/lib/mock/invoices";
import { formatCurrency } from "@/lib/utils";

export type ReportPeriod = "mes" | "3m" | "todo";

export const reportPeriodLabels: Record<ReportPeriod, string> = {
  mes: "Mes actual",
  "3m": "Últimos 3 meses",
  todo: "Todo el histórico",
};

// "YYYY-MM-DD" is parsed as UTC midnight by `new Date(string)`; reading local
// getters back (getMonth, getFullYear) can roll the date into the previous day
// under a negative UTC offset. Parsing the parts directly keeps it local and
// unambiguous regardless of the host timezone.
function parseLocalDate(dateValue: string): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const REPORTS_REFERENCE_DATE = new Date(2026, 6, 3);

export function isWithinReportPeriod(dateValue: string, period: ReportPeriod): boolean {
  if (period === "todo" || !dateValue) return true;

  const date = parseLocalDate(dateValue);

  if (period === "mes") {
    return (
      date.getFullYear() === REPORTS_REFERENCE_DATE.getFullYear() &&
      date.getMonth() === REPORTS_REFERENCE_DATE.getMonth()
    );
  }

  const threshold = new Date(REPORTS_REFERENCE_DATE);
  threshold.setMonth(threshold.getMonth() - 3);
  return date >= threshold && date <= REPORTS_REFERENCE_DATE;
}

const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export type MonthlyBillingPoint = { key: string; label: string; facturado: number; cobrado: number };

export function getMonthlyBilling(invoiceList: Invoice[]): MonthlyBillingPoint[] {
  const byMonth = new Map<string, MonthlyBillingPoint>();

  for (const invoice of invoiceList) {
    if (invoice.estado === "borrador" || invoice.estado === "anulada" || !invoice.fechaEmision) continue;

    const date = parseLocalDate(invoice.fechaEmision);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const point = byMonth.get(key) ?? { key, label: monthLabels[date.getMonth()], facturado: 0, cobrado: 0 };

    point.facturado += invoice.total;
    if (invoice.estado === "pagada") point.cobrado += invoice.total;

    byMonth.set(key, point);
  }

  return Array.from(byMonth.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export type ClientAmount = { client: Client; amount: number };

export function getTopClientsByBilling(invoiceList: Invoice[], limit = 5): ClientAmount[] {
  const totals = new Map<string, number>();

  for (const invoice of invoiceList) {
    if (invoice.estado === "borrador" || invoice.estado === "anulada") continue;
    totals.set(invoice.clientId, (totals.get(invoice.clientId) ?? 0) + invoice.total);
  }

  return Array.from(totals.entries())
    .map(([clientId, amount]) => ({ client: getClientById(clientId), amount }))
    .filter((entry): entry is ClientAmount => Boolean(entry.client))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function getTopClientsByDebt(invoiceList: Invoice[], limit = 5): ClientAmount[] {
  const totals = new Map<string, number>();

  for (const invoice of invoiceList) {
    if (invoice.saldoPendiente <= 0) continue;
    totals.set(invoice.clientId, (totals.get(invoice.clientId) ?? 0) + invoice.saldoPendiente);
  }

  return Array.from(totals.entries())
    .map(([clientId, amount]) => ({ client: getClientById(clientId), amount }))
    .filter((entry): entry is ClientAmount => Boolean(entry.client))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export type EmployeeHours = { employee: Employee; horas: number; facturacion: number; costo: number; margen: number };

export function getHoursByEmployee(entries: HourEntry[]): EmployeeHours[] {
  const totals = new Map<string, EmployeeHours>();

  for (const entry of entries) {
    const employee = getEmployeeById(entry.employeeId);
    if (!employee) continue;

    const metrics = getHourEntryMetrics(entry);
    const current = totals.get(employee.id) ?? { employee, horas: 0, facturacion: 0, costo: 0, margen: 0 };
    current.horas += entry.horas;
    current.facturacion += metrics.facturacion;
    current.costo += metrics.costo;
    current.margen += metrics.margen;
    totals.set(employee.id, current);
  }

  return Array.from(totals.values()).sort((a, b) => b.horas - a.horas);
}

export type ClientProfitability = {
  client: Client;
  horas: number;
  facturacion: number;
  costo: number;
  margen: number;
  margenPct: number;
};

export function getClientProfitability(entries: HourEntry[], limit = 6): ClientProfitability[] {
  const totals = new Map<string, Omit<ClientProfitability, "margenPct">>();

  for (const entry of entries) {
    const client = getClientById(entry.clientId);
    if (!client) continue;

    const metrics = getHourEntryMetrics(entry);
    const current = totals.get(client.id) ?? { client, horas: 0, facturacion: 0, costo: 0, margen: 0 };
    current.horas += entry.horas;
    current.facturacion += metrics.facturacion;
    current.costo += metrics.costo;
    current.margen += metrics.margen;
    totals.set(client.id, current);
  }

  return Array.from(totals.values())
    .map((item) => ({ ...item, margenPct: item.facturacion > 0 ? (item.margen / item.facturacion) * 100 : 0 }))
    .sort((a, b) => b.margen - a.margen)
    .slice(0, limit);
}

export type EmployeeProductivity = { employee: Employee; productividad: number; margenPorHora: number; horas: number };

export function getTeamProductivity(entries: HourEntry[]): EmployeeProductivity[] {
  const byEmployee = new Map<string, HourEntry[]>();

  for (const entry of entries) {
    const list = byEmployee.get(entry.employeeId) ?? [];
    list.push(entry);
    byEmployee.set(entry.employeeId, list);
  }

  const result: EmployeeProductivity[] = [];

  for (const [employeeId, employeeEntries] of byEmployee) {
    const employee = getEmployeeById(employeeId);
    if (!employee) continue;

    const summary = summarizeHours(employeeEntries);
    result.push({
      employee,
      productividad: getProductivityRate(employeeEntries),
      margenPorHora: summary.horas > 0 ? Math.round(summary.margen / summary.horas) : 0,
      horas: summary.horas,
    });
  }

  return result.sort((a, b) => b.productividad - a.productividad);
}

export function getReportsSummary(invoiceList: Invoice[], entries: HourEntry[]) {
  const billing = summarizeInvoices(invoiceList);
  const hoursSummary = summarizeHours(entries);
  const margenPct = hoursSummary.facturacion > 0 ? (hoursSummary.margen / hoursSummary.facturacion) * 100 : 0;

  return {
    totalFacturado: billing.totalFacturado,
    cobrado: billing.cobrado,
    pendienteMasVencido: billing.pendienteCobro + billing.vencido,
    margenPct,
  };
}

export function getClientsInMora(): Client[] {
  return clients.filter((client) => client.estado === "mora");
}

export function getReportsAiInsights(invoiceList: Invoice[], entries: HourEntry[]): string[] {
  const insights: string[] = [];

  const topDebt = getTopClientsByDebt(invoiceList, 1)[0];
  if (topDebt) {
    insights.push(
      `${topDebt.client.nombreComercial} concentra la mayor deuda (${formatCurrency(topDebt.amount)}). Priorizá el seguimiento de cobranza.`
    );
  }

  const topProfitability = getClientProfitability(entries, 1)[0];
  if (topProfitability) {
    insights.push(
      `${topProfitability.client.nombreComercial} es el cliente más rentable, con un margen de ${topProfitability.margenPct.toFixed(0)}% sobre lo facturado.`
    );
  }

  const productivity = getTeamProductivity(entries);
  const lowestProductivity = productivity[productivity.length - 1];
  if (lowestProductivity && productivity.length > 1) {
    insights.push(
      `${lowestProductivity.employee.nombre} registra la productividad más baja del equipo (${lowestProductivity.productividad}%). Revisá su carga de horas pendientes.`
    );
  }

  const vencidas = invoiceList.filter((invoice) => invoice.estado === "vencida").length;
  if (vencidas > 0) {
    insights.push(`Hay ${vencidas} facturas vencidas sin cobrar. Enviá recordatorios antes de que se acumule más mora.`);
  }

  const enMora = getClientsInMora().length;
  if (enMora > 0) {
    insights.push(`${enMora} clientes están en estado de mora. Considerá pausar servicios si no responden a los recordatorios.`);
  }

  return insights;
}
