import Link from "next/link";
import { Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { CollectionActionButtons } from "@/components/collections/CollectionActionButtons";
import { CollectionStatusBadge } from "@/components/collections/CollectionStatusBadge";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  collectionPriorityLabels,
  suggestedChannelLabels,
  type CollectionPriority,
  type SuggestedChannel,
} from "@/lib/collectionLabels";
import type { ClientCollectionGroup } from "@/lib/data/collections";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

const priorityStyles: Record<CollectionPriority, string> = {
  alta: "bg-rose-50 text-rose-700 ring-rose-600/20",
  media: "bg-amber-50 text-amber-700 ring-amber-600/20",
  baja: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

const channelIcons: Record<SuggestedChannel, LucideIcon> = {
  llamada: Phone,
  whatsapp: MessageCircle,
  email: Mail,
};

export function ClientCollectionCard({ group }: { group: ClientCollectionGroup }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
            {getInitials(group.client.nombreComercial)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/clients/${group.client.id}`}
                className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
              >
                {group.client.nombreComercial}
              </Link>
              {/* Estado de cobranza (severidad por vencimiento), prioridad
                  y seguimiento — información complementaria, no excluyente
                  entre sí ni con el estado financiero de cada factura (ver
                  abajo, por ítem). */}
              <CollectionStatusBadge status={group.peorEstadoCobranza} />
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                  priorityStyles[group.prioridad]
                )}
              >
                Prioridad {collectionPriorityLabels[group.prioridad]}
              </span>
              {group.tieneSeguimientoActivo && <StatusBadge label="En seguimiento" variant="info" />}
            </div>
            <p className="mt-1 text-xs text-slate-500">Responsable interno: {group.client.responsableInterno}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 text-sm">
          <div className="text-right">
            <p className="text-xs text-slate-400">Saldo pendiente</p>
            <p className="font-semibold text-slate-900">{formatCurrency(group.totalPendiente)}</p>
          </div>
          {group.diasMoraMax > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Días de mora</p>
              <p className="font-semibold text-rose-600">{group.diasMoraMax} d</p>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {group.items.map((item) => {
          const ChannelIcon = channelIcons[item.canalSugerido];
          return (
            <div
              key={item.invoice.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <Link
                  href={`/invoices/${item.invoice.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {item.invoice.numero}
                </Link>
                <span className="text-xs text-slate-400">Vence {formatDate(item.invoice.fechaVencimiento)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="text-sm font-medium text-slate-800">{formatCurrency(item.invoice.saldoPendiente)}</span>

                <span className={cn("text-xs font-medium", item.diasMora > 0 ? "text-rose-600" : "text-slate-500")}>
                  {item.diasMora > 0
                    ? `${item.diasMora} días de mora`
                    : item.diasMora === 0
                      ? "Vence hoy"
                      : `Vence en ${Math.abs(item.diasMora)} días`}
                </span>

                {/* Dos ejes independientes, uno al lado del otro: estado
                    financiero (¿se cobró o no?) y estado de cobranza
                    (¿qué tan urgente es gestionarla?) — nunca colapsados
                    en un único valor. */}
                <InvoiceStatusBadge status={item.invoice.estado} />
                <CollectionStatusBadge status={item.estadoCobranza} />
                {item.followUp.enSeguimiento && <StatusBadge label="En seguimiento" variant="info" />}

                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <ChannelIcon className="h-3.5 w-3.5" />
                  {suggestedChannelLabels[item.canalSugerido]}
                </span>

                <CollectionActionButtons />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
