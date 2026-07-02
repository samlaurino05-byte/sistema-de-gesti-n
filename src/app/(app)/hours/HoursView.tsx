"use client";

import { useMemo, useState } from "react";
import { Banknote, Clock3, Scale, Search, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { HourRow } from "@/components/hours/HourRow";
import { HourTableHead } from "@/components/hours/HourTableHead";
import { NewHourEntryButton } from "@/components/hours/NewHourEntryButton";
import type { Client } from "@/lib/mock/clients";
import type { Employee } from "@/lib/mock/employees";
import { hourEntryStatusLabels, summarizeHours, type HourEntry, type HourEntryStatus } from "@/lib/mock/hours";
import { cn, formatCurrency } from "@/lib/utils";

type StatusFilter = "todas" | HourEntryStatus;

const statusFilters: StatusFilter[] = ["todas", "pendiente", "aprobada", "rechazada", "facturada"];

type HoursViewProps = {
  hourEntries: HourEntry[];
  employees: Employee[];
  clients: Client[];
};

export function HoursView({ hourEntries, employees, clients }: HoursViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [employeeFilter, setEmployeeFilter] = useState("todos");
  const [clientFilter, setClientFilter] = useState("todos");

  const metrics = useMemo(() => summarizeHours(hourEntries), [hourEntries]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return hourEntries.filter((entry) => {
      const employee = employees.find((item) => item.id === entry.employeeId);
      const client = clients.find((item) => item.id === entry.clientId);

      const matchesStatus = statusFilter === "todas" || entry.estado === statusFilter;
      const matchesEmployee = employeeFilter === "todos" || entry.employeeId === employeeFilter;
      const matchesClient = clientFilter === "todos" || entry.clientId === clientFilter;
      const matchesQuery =
        query.length === 0 ||
        entry.proyecto.toLowerCase().includes(query) ||
        employee?.nombre.toLowerCase().includes(query) ||
        client?.nombreComercial.toLowerCase().includes(query);

      return matchesStatus && matchesEmployee && matchesClient && matchesQuery;
    });
  }, [hourEntries, employees, clients, search, statusFilter, employeeFilter, clientFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Horas trabajadas</h2>
          <p className="mt-1 text-sm text-slate-500">{hourEntries.length} registros cargados</p>
        </div>
        <NewHourEntryButton />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Horas totales" value={`${metrics.horas} h`} icon={Clock3} tone="default" />
        <MetricCard label="Costo interno" value={formatCurrency(metrics.costo)} icon={Wallet} tone="default" />
        <MetricCard label="Facturación generada" value={formatCurrency(metrics.facturacion)} icon={Banknote} tone="success" />
        <MetricCard
          label="Margen"
          value={formatCurrency(metrics.margen)}
          icon={Scale}
          tone={metrics.margen >= 0 ? "success" : "danger"}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por proyecto, empleado o cliente..."
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-indigo-300 focus:outline-none"
            >
              <option value="todos">Todos los empleados</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nombre}
                </option>
              ))}
            </select>

            <select
              value={clientFilter}
              onChange={(event) => setClientFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-indigo-300 focus:outline-none"
            >
              <option value="todos">Todos los clientes</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombreComercial}
                </option>
              ))}
            </select>

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
                  {status === "todas" ? "Todas" : hourEntryStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse">
              <HourTableHead />
              <tbody>
                {filteredEntries.map((entry) => (
                  <HourRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se encontraron registros</p>
            <p className="mt-1 text-xs text-slate-400">Probá con otro término de búsqueda o cambiá los filtros.</p>
          </div>
        )}
      </section>
    </div>
  );
}
