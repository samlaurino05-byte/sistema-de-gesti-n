import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollectionStatusBadge } from "@/components/collections/CollectionStatusBadge";
import { collectionPriorityLabels, type ClientCollectionGroup } from "@/lib/mock/collections";
import { formatCurrency } from "@/lib/utils";

export function ClientCollectionSummary({ group }: { group: ClientCollectionGroup | null }) {
  if (!group) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Cobranzas</h3>
        <p className="mt-2 text-sm text-slate-500">Sin facturas pendientes de cobro. Cuenta al día.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Cobranzas</h3>
        <CollectionStatusBadge status={group.peorEstado} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-400">Saldo pendiente</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{formatCurrency(group.totalPendiente)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Prioridad</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{collectionPriorityLabels[group.prioridad]}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Facturas en gestión</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{group.items.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Días de mora</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">{group.diasMoraMax > 0 ? `${group.diasMoraMax} d` : "—"}</dd>
        </div>
      </dl>

      <Link
        href={`/collections?cliente=${group.client.id}`}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        Ver en Cobranzas
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
