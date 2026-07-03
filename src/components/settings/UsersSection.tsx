"use client";

import { useMemo, useState } from "react";
import { Search, UserCheck, UserPlus, Users } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { InviteUserButton } from "@/components/settings/InviteUserButton";
import { PermissionsMatrix } from "@/components/settings/PermissionsMatrix";
import { UserRow } from "@/components/settings/UserRow";
import {
  systemUsers,
  userRoleLabels,
  userStatusLabels,
  type UserRole,
  type UserStatus,
} from "@/lib/mock/settings";
import { cn } from "@/lib/utils";

type RoleFilter = "todos" | UserRole;
type StatusFilter = "todos" | UserStatus;

const roleFilters: RoleFilter[] = ["todos", "administrador", "supervisor", "contador", "colaborador"];
const statusFilters: StatusFilter[] = ["todos", "activo", "invitacion_pendiente", "inactivo"];

export function UsersSection() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");

  const metrics = useMemo(() => {
    const activos = systemUsers.filter((user) => user.estado === "activo").length;
    const pendientes = systemUsers.filter((user) => user.estado === "invitacion_pendiente").length;

    return { total: systemUsers.length, activos, pendientes };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return systemUsers.filter((user) => {
      const matchesRole = roleFilter === "todos" || user.rol === roleFilter;
      const matchesStatus = statusFilter === "todos" || user.estado === statusFilter;
      const matchesQuery =
        query.length === 0 ||
        user.nombre.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Usuarios y roles</h2>
          <p className="mt-1 text-sm text-slate-500">Personas con acceso al sistema y su nivel de permisos</p>
        </div>
        <InviteUserButton />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Usuarios totales" value={String(metrics.total)} icon={Users} tone="default" />
        <MetricCard label="Activos" value={String(metrics.activos)} icon={UserCheck} tone="success" />
        <MetricCard label="Invitaciones pendientes" value={String(metrics.pendientes)} icon={UserPlus} tone="warning" />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors focus-within:border-indigo-300 focus-within:bg-white">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:border-indigo-300 focus:outline-none"
            >
              <option value="todos">Todos los roles</option>
              {roleFilters.slice(1).map((role) => (
                <option key={role} value={role}>
                  {userRoleLabels[role as UserRole]}
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
                  {status === "todos" ? "Todos" : userStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se encontraron usuarios</p>
            <p className="mt-1 text-xs text-slate-400">Probá con otro término de búsqueda o cambiá los filtros.</p>
          </div>
        )}
      </section>

      <PermissionsMatrix />
    </div>
  );
}
