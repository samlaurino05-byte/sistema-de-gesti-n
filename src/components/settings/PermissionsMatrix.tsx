"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import {
  permissionActionLabels,
  permissionActionOrder,
  rolePermissions,
  settingsModuleLabels,
  settingsModuleOrder,
  userRoleLabels,
  type UserRole,
} from "@/lib/mock/settings";
import { cn } from "@/lib/utils";

const roleOrder: UserRole[] = ["administrador", "supervisor", "contador", "colaborador"];

export function PermissionsMatrix() {
  const [role, setRole] = useState<UserRole>("administrador");
  const matrix = rolePermissions[role];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Permisos por rol</h3>
          <p className="mt-0.5 text-xs text-slate-500">Vista mock — todavía no controla el acceso real al sistema.</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {roleOrder.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRole(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                role === item ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {userRoleLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="whitespace-nowrap px-4 py-3 sm:px-5">Módulo</th>
              {permissionActionOrder.map((action) => (
                <th key={action} className="whitespace-nowrap px-4 py-3 text-center">
                  {permissionActionLabels[action]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {settingsModuleOrder.map((module) => (
              <tr key={module} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800 sm:px-5">
                  {settingsModuleLabels[module]}
                </td>
                {permissionActionOrder.map((action) => {
                  const allowed = matrix[module][action];
                  return (
                    <td key={action} className="px-4 py-3 text-center">
                      {allowed ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-slate-300" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
