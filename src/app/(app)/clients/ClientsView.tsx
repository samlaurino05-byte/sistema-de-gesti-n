"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Search, UserCheck, Users, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { ClientRow } from "@/components/clients/ClientRow";
import { NewClientButton } from "@/components/clients/NewClientButton";
import { statusLabels, type Client, type ClientStatus } from "@/lib/mock/clients";
import { cn, formatCurrency } from "@/lib/utils";

type StatusFilter = "todos" | ClientStatus;

const statusFilters: StatusFilter[] = ["todos", "activo", "mora", "pausado", "inactivo"];

export function ClientsView({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const metrics = useMemo(() => {
    const activos = clients.filter((client) => client.estado === "activo").length;
    const enMora = clients.filter((client) => client.estado === "mora").length;
    const facturacionTotal = clients.reduce((sum, client) => sum + client.facturacionMensual, 0);

    return { total: clients.length, activos, enMora, facturacionTotal };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus = statusFilter === "todos" || client.estado === statusFilter;
      const matchesQuery =
        query.length === 0 ||
        client.razonSocial.toLowerCase().includes(query) ||
        client.nombreComercial.toLowerCase().includes(query) ||
        client.cuit.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [clients, search, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Cartera de clientes</h2>
          <p className="mt-1 text-sm text-slate-500">
            {metrics.total} clientes registrados · {metrics.enMora} en mora
          </p>
        </div>
        <NewClientButton />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total de clientes" value={String(metrics.total)} icon={Users} tone="default" />
        <MetricCard label="Clientes activos" value={String(metrics.activos)} icon={UserCheck} tone="success" />
        <MetricCard label="En mora" value={String(metrics.enMora)} icon={AlertTriangle} tone="danger" />
        <MetricCard
          label="Facturación mensual"
          value={formatCurrency(metrics.facturacionTotal)}
          icon={Wallet}
          tone="default"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, razón social o CUIT..."
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
                {status === "todos" ? "Todos" : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {filteredClients.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se encontraron clientes</p>
            <p className="mt-1 text-xs text-slate-400">Probá con otro término de búsqueda o cambiá el filtro de estado.</p>
          </div>
        )}
      </section>
    </div>
  );
}
