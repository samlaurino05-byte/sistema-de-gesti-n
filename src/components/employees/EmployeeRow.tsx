import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EmployeeStatusBadge } from "@/components/employees/EmployeeStatusBadge";
import { getAssignedClients, type Employee } from "@/lib/mock/employees";
import { formatCurrency, getInitials } from "@/lib/utils";

export function EmployeeRow({ employee }: { employee: Employee }) {
  const assignedClients = getAssignedClients(employee);

  return (
    <Link
      href={`/employees/${employee.id}`}
      className="grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:grid-cols-[2fr_1fr_1.4fr_1fr_1fr_auto] sm:items-center sm:gap-4 sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
          {getInitials(employee.nombre)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{employee.nombre}</p>
          <p className="truncate text-xs text-slate-500">
            {employee.cargo} · {employee.area}
          </p>
        </div>
      </div>

      <div className="min-w-0 text-sm text-slate-600 sm:truncate">
        <span className="text-slate-400 sm:hidden">Valor hora: </span>
        {formatCurrency(employee.valorHoraInterno)}
      </div>

      <div className="min-w-0 text-sm text-slate-600">
        <p className="truncate">
          <span className="text-slate-400 sm:hidden">Email: </span>
          {employee.email}
        </p>
        <p className="truncate text-xs text-slate-400">{employee.telefono}</p>
      </div>

      <div className="min-w-0 text-sm text-slate-600 sm:truncate">
        <span className="text-slate-400 sm:hidden">Clientes: </span>
        {assignedClients.length > 0
          ? `${assignedClients.length} cliente${assignedClients.length === 1 ? "" : "s"}`
          : "Sin asignar"}
      </div>

      <div className="min-w-0 sm:truncate">
        <EmployeeStatusBadge status={employee.estado} />
      </div>

      <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
    </Link>
  );
}
