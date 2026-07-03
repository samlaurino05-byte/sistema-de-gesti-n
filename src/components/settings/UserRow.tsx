import { UserRoleBadge } from "@/components/settings/UserRoleBadge";
import { UserStatusBadge } from "@/components/settings/UserStatusBadge";
import type { SystemUser } from "@/lib/mock/settings";
import { formatDate, getInitials } from "@/lib/utils";

export function UserRow({ user }: { user: SystemUser }) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-3.5 sm:grid-cols-[2fr_1fr_1fr_1fr] sm:items-center sm:gap-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
          {getInitials(user.nombre)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{user.nombre}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="min-w-0 sm:truncate">
        <span className="text-slate-400 sm:hidden">Rol: </span>
        <UserRoleBadge role={user.rol} />
      </div>

      <div className="min-w-0 sm:truncate">
        <span className="text-slate-400 sm:hidden">Estado: </span>
        <UserStatusBadge status={user.estado} />
      </div>

      <div className="min-w-0 text-sm text-slate-600 sm:truncate">
        <span className="text-slate-400 sm:hidden">Último acceso: </span>
        {user.ultimoAcceso ? formatDate(user.ultimoAcceso) : "Nunca"}
      </div>
    </div>
  );
}
