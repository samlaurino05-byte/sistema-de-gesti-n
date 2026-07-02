import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { cn, formatCurrency } from "@/lib/utils";
import type { Client } from "@/lib/mock/clients";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function ClientRow({ client }: { client: Client }) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4 sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
          {getInitials(client.nombreComercial)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{client.nombreComercial}</p>
          <p className="truncate text-xs text-slate-500">{client.cuit}</p>
        </div>
      </div>

      <div className="min-w-0 text-sm text-slate-600 sm:truncate">
        <span className="text-slate-400 sm:hidden">Responsable: </span>
        {client.responsableInterno}
      </div>

      <div className="min-w-0 text-sm text-slate-600 sm:truncate">
        <span className="text-slate-400 sm:hidden">Facturación mensual: </span>
        {formatCurrency(client.facturacionMensual)}
      </div>

      <div className="min-w-0 text-sm sm:truncate">
        <span className="text-slate-400 sm:hidden">Deuda pendiente: </span>
        <span className={cn("font-medium", client.deudaPendiente > 0 ? "text-rose-600" : "text-slate-600")}>
          {formatCurrency(client.deudaPendiente)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <ClientStatusBadge status={client.estado} />
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
      </div>
    </Link>
  );
}
