"use client";

import { useState } from "react";
import { Check, Minus, Plus, Sparkles, X } from "lucide-react";
import {
  permissionActionOrder,
  rolePermissions,
  settingsModuleLabels,
  settingsModuleOrder,
  userRoleDescriptions,
  userRoleLabels,
  type UserRole,
} from "@/lib/mock/settings";

const roleOptions: UserRole[] = ["administrador", "supervisor", "contador", "colaborador"];

export function InviteUserButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("colaborador");

  function handleClose() {
    setIsOpen(false);
    setRole("colaborador");
  }

  const matrix = rolePermissions[role];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Invitar usuario
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Invitar usuario</h2>
                <p className="mt-0.5 text-xs text-slate-500">Formulario mock — el resumen de permisos se actualiza en vivo</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-slate-600">
                Email
                <input
                  type="email"
                  disabled
                  placeholder="nombre@estudio.com.ar"
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 placeholder:text-slate-300"
                />
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Rol
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
                >
                  {roleOptions.map((option) => (
                    <option key={option} value={option}>
                      {userRoleLabels[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700 ring-1 ring-inset ring-indigo-100">
              {userRoleDescriptions[role]}
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-600">Resumen de permisos — {userRoleLabels[role]}</p>
              <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[420px] border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-left font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-2">Módulo</th>
                      {permissionActionOrder.map((action) => (
                        <th key={action} className="px-2 py-2 text-center capitalize">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {settingsModuleOrder.map((module) => (
                      <tr key={module} className="border-t border-slate-100">
                        <td className="px-3 py-1.5 font-medium text-slate-700">{settingsModuleLabels[module]}</td>
                        {permissionActionOrder.map((action) => (
                          <td key={action} className="px-2 py-1.5 text-center">
                            {matrix[module][action] ? (
                              <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Minus className="mx-auto h-3.5 w-3.5 text-slate-300" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 ring-1 ring-inset ring-slate-100">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
              Vista previa mock — el envío de invitaciones se habilitará cuando el módulo se conecte a datos reales.
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
