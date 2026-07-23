"use client";

import { useMemo, useState } from "react";
import { AlertOctagon, Banknote, Clock3, Search, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { AiPanel } from "@/components/ui/AiPanel";
import { ClientCollectionCard } from "@/components/collections/ClientCollectionCard";
import { collectionStatusLabels, type CollectionStatus } from "@/lib/collectionLabels";
import type { ClientCollectionGroup, CollectionsDailySummary, CollectionsSummary } from "@/lib/data/collections";
import { cn, formatCurrency } from "@/lib/utils";

type StatusFilter = "todas" | CollectionStatus;

const statusFilters: StatusFilter[] = ["todas", "critica", "vencida", "por-vencer", "al-dia"];

type CollectionsViewProps = {
  groups: ClientCollectionGroup[];
  summary: CollectionsSummary;
  dailySummary: CollectionsDailySummary;
  aiSuggestions: { text: string }[];
  initialSearch?: string;
};

// Sprint 8.7C.1: los grupos, el resumen y las sugerencias de IA ya llegan
// completamente resueltos desde src/lib/data/collections.ts (vía
// page.tsx) — este componente solo filtra por texto/estado sobre datos ya
// agrupados. No suma pagos, no calcula mora ni decide prioridad; mismo
// criterio que InvoicesView/ClientsView.
export function CollectionsView({ groups, summary, dailySummary, aiSuggestions, initialSearch = "" }: CollectionsViewProps) {
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const matchesStatus = statusFilter === "todas" || item.estadoCobranza === statusFilter;
          const matchesQuery =
            query.length === 0 ||
            group.client.nombreComercial.toLowerCase().includes(query) ||
            group.client.cuit.toLowerCase().includes(query) ||
            item.invoice.numero.toLowerCase().includes(query);

          return matchesStatus && matchesQuery;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, search, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Cobranzas</h2>
          <p className="mt-1 text-sm text-slate-500">
            {dailySummary.clientes} clientes con facturas en gestión · {dailySummary.criticas} en estado crítico
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total pendiente" value={formatCurrency(summary.totalPendiente)} icon={Wallet} tone="default" />
        <MetricCard label="Vencido" value={formatCurrency(summary.vencido)} icon={AlertOctagon} tone="danger" />
        <MetricCard label="Por vencer" value={formatCurrency(summary.porVencer)} icon={Clock3} tone="warning" />
        <MetricCard label="Cobrado este mes" value={formatCurrency(summary.cobradoEsteMes)} icon={Banknote} tone="success" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors focus-within:border-indigo-300 focus-within:bg-white">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por cliente, CUIT o número de factura..."
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
                    {status === "todas" ? "Todas" : collectionStatusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {filteredGroups.length > 0 ? (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <ClientCollectionCard key={group.client.id} group={group} />
              ))}
            </div>
          ) : (
            <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-medium text-slate-600">No se encontraron facturas en gestión</p>
              <p className="mt-1 text-xs text-slate-400">Probá con otro término de búsqueda o cambiá el filtro de estado.</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Resumen del día</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Clientes en gestión</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{dailySummary.clientes}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Críticas</dt>
                <dd className="mt-0.5 font-semibold text-rose-600">{dailySummary.criticas}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Por vencer</dt>
                <dd className="mt-0.5 font-semibold text-amber-600">{dailySummary.porVencer}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">En seguimiento</dt>
                <dd className="mt-0.5 font-semibold text-indigo-600">{dailySummary.enSeguimiento}</dd>
              </div>
            </dl>
          </section>

          <AiPanel suggestions={aiSuggestions} />
        </div>
      </div>
    </div>
  );
}
