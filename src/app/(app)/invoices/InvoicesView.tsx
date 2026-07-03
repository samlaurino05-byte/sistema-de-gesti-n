"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock3, FileWarning, Search, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { InvoiceRow } from "@/components/invoices/InvoiceRow";
import { NewInvoiceButton } from "@/components/invoices/NewInvoiceButton";
import { getClientById } from "@/lib/mock/clients";
import { invoiceStatusLabels, summarizeInvoices, type Invoice, type InvoiceStatus } from "@/lib/mock/invoices";
import { cn, formatCurrency } from "@/lib/utils";

type StatusFilter = "todas" | InvoiceStatus;

const statusFilters: StatusFilter[] = ["todas", "borrador", "emitida", "pagada", "vencida", "anulada"];

export function InvoicesView({ invoices }: { invoices: Invoice[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");

  const metrics = useMemo(() => summarizeInvoices(invoices), [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const client = getClientById(invoice.clientId);
      const matchesStatus = statusFilter === "todas" || invoice.estado === statusFilter;
      const matchesQuery =
        query.length === 0 ||
        invoice.numero.toLowerCase().includes(query) ||
        client?.nombreComercial.toLowerCase().includes(query) ||
        client?.razonSocial.toLowerCase().includes(query) ||
        client?.cuit.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [invoices, search, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Facturación</h2>
          <p className="mt-1 text-sm text-slate-500">{invoices.length} comprobantes registrados</p>
        </div>
        <NewInvoiceButton />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total facturado" value={formatCurrency(metrics.totalFacturado)} icon={Banknote} tone="default" />
        <MetricCard
          label="Pendiente de cobro"
          value={formatCurrency(metrics.pendienteCobro)}
          icon={Clock3}
          tone="warning"
        />
        <MetricCard label="Vencido" value={formatCurrency(metrics.vencido)} icon={FileWarning} tone="danger" />
        <MetricCard label="Cobrado" value={formatCurrency(metrics.cobrado)} icon={Wallet} tone="success" />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por número, cliente o CUIT..."
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {status === "todas" ? "Todas" : invoiceStatusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {filteredInvoices.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredInvoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se encontraron facturas</p>
            <p className="mt-1 text-xs text-slate-400">Probá con otro término de búsqueda o cambiá el filtro de estado.</p>
          </div>
        )}
      </section>
    </div>
  );
}
