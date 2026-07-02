import { Briefcase, Mail } from "lucide-react";
import { EmployeeStatusBadge } from "@/components/employees/EmployeeStatusBadge";
import type { Employee } from "@/lib/mock/employees";
import { getInitials } from "@/lib/utils";

export function EmployeeWorkspaceHeader({ employee }: { employee: Employee }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
            {getInitials(employee.nombre)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">{employee.nombre}</h1>
              <EmployeeStatusBadge status={employee.estado} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Briefcase className="h-3.5 w-3.5" />
              {employee.cargo} · {employee.area}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Mail className="h-4 w-4 text-slate-400" />
          <span className="truncate font-medium text-slate-900">{employee.email}</span>
        </div>
      </div>
    </section>
  );
}
