import { Building2, UserRound } from "lucide-react";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
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

export function ClientWorkspaceHeader({ client }: { client: Client }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white">
            {getInitials(client.nombreComercial)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">{client.razonSocial}</h1>
              <ClientStatusBadge status={client.estado} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              CUIT {client.cuit} · {client.condicionFiscal}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <UserRound className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">Responsable:</span>
          <span className="font-medium text-slate-900">{client.responsableInterno}</span>
        </div>
      </div>
    </section>
  );
}
