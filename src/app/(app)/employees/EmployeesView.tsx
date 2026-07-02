"use client";

import { useMemo, useState } from "react";
import { Activity, Clock3, Search, UserCheck, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmployeeRow } from "@/components/employees/EmployeeRow";
import { NewEmployeeButton } from "@/components/employees/NewEmployeeButton";
import { employeeStatusLabels, type Employee, type EmployeeStatus } from "@/lib/mock/employees";
import { getProductivityRate, isCurrentMonth, summarizeHours, type HourEntry } from "@/lib/mock/hours";
import { cn, formatCurrency } from "@/lib/utils";

type StatusFilter = "todos" | EmployeeStatus;

const statusFilters: StatusFilter[] = ["todos", "activo", "vacaciones", "licencia", "inactivo"];

export function EmployeesView({ employees, hourEntries }: { employees: Employee[]; hourEntries: HourEntry[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [areaFilter, setAreaFilter] = useState("todas");
  const [cargoFilter, setCargoFilter] = useState("todos");

  const areas = useMemo(() => Array.from(new Set(employees.map((employee) => employee.area))).sort(), [employees]);
  const cargos = useMemo(() => Array.from(new Set(employees.map((employee) => employee.cargo))).sort(), [employees]);

  const entriesThisMonth = useMemo(() => hourEntries.filter((entry) => isCurrentMonth(entry.fecha)), [hourEntries]);

  const metrics = useMemo(() => {
    const activos = employees.filter((employee) => employee.estado === "activo").length;
    const summary = summarizeHours(entriesThisMonth);
    const productividad = getProductivityRate(entriesThisMonth);

    return { activos, horas: summary.horas, costo: summary.costo, productividad };
  }, [employees, entriesThisMonth]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesStatus = statusFilter === "todos" || employee.estado === statusFilter;
      const matchesArea = areaFilter === "todas" || employee.area === areaFilter;
      const matchesCargo = cargoFilter === "todos" || employee.cargo === cargoFilter;
      const matchesQuery =
        query.length === 0 ||
        employee.nombre.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.cargo.toLowerCase().includes(query);

      return matchesStatus && matchesArea && matchesCargo && matchesQuery;
    });
  }, [employees, search, statusFilter, areaFilter, cargoFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Equipo de trabajo</h2>
          <p className="mt-1 text-sm text-slate-500">
            {metrics.activos} empleados activos · {employees.length} en total
          </p>
        </div>
        <NewEmployeeButton />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Empleados activos" value={String(metrics.activos)} icon={UserCheck} tone="success" />
        <MetricCard label="Horas registradas este mes" value={`${metrics.horas} h`} icon={Clock3} tone="default" />
        <MetricCard
          label="Costo laboral estimado"
          value={formatCurrency(metrics.costo)}
          icon={Wallet}
          tone="default"
        />
        <MetricCard
          label="Productividad promedio"
          value={`${metrics.productividad}%`}
          icon={Activity}
          tone={metrics.productividad >= 70 ? "success" : "warning"}
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
              placeholder="Buscar por nombre, email o cargo..."
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-indigo-300 focus:outline-none"
            >
              <option value="todas">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select
              value={cargoFilter}
              onChange={(event) => setCargoFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-indigo-300 focus:outline-none"
            >
              <option value="todos">Todos los roles</option>
              {cargos.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
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
                  {status === "todos" ? "Todos" : employeeStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredEmployees.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredEmployees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se encontraron empleados</p>
            <p className="mt-1 text-xs text-slate-400">Probá con otro término de búsqueda o cambiá los filtros.</p>
          </div>
        )}
      </section>
    </div>
  );
}
