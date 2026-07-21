import { Header } from "@/components/layout/Header";
import { InvoicesView } from "@/app/(app)/invoices/InvoicesView";
import {
  getInvoicesForOrganization,
  getBillableHourEntriesForOrganization,
  summarizeInvoiceList,
  type InvoiceListItem,
  type InvoicesSummary,
} from "@/lib/data/invoices";
import { getClientsForOrganization } from "@/lib/data/clients";
import { requireActiveSession } from "@/lib/auth/session";
import type { Client } from "@/lib/mock/clients";
import type { HourEntry } from "@/lib/mock/hours";

export const dynamic = "force-dynamic";

const EMPTY_SUMMARY: InvoicesSummary = { totalFacturado: 0, pendienteCobro: 0, vencido: 0, cobrado: 0 };

export default async function InvoicesPage() {
  const session = await requireActiveSession();

  let invoices: InvoiceListItem[] = [];
  let summary: InvoicesSummary = EMPTY_SUMMARY;
  let clients: Client[] = [];
  let billableHourEntries: HourEntry[] = [];
  let loadError = false;

  try {
    [invoices, clients, billableHourEntries] = await Promise.all([
      getInvoicesForOrganization(session.organizationId),
      getClientsForOrganization(session.organizationId),
      getBillableHourEntriesForOrganization(session.organizationId),
    ]);
    summary = summarizeInvoiceList(invoices);
  } catch (error) {
    console.error("No se pudo cargar la facturación:", error);
    loadError = true;
  }

  return (
    <>
      <Header title="Facturación" subtitle="Comprobantes emitidos y estado de cobro" />
      <main className="flex-1 p-4 sm:p-6">
        {loadError ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se pudo cargar la facturación</p>
            <p className="mt-1 text-xs text-slate-400">Probá recargar la página en unos segundos.</p>
          </div>
        ) : (
          <InvoicesView
            invoices={invoices}
            summary={summary}
            clients={clients}
            billableHourEntries={billableHourEntries}
          />
        )}
      </main>
    </>
  );
}
