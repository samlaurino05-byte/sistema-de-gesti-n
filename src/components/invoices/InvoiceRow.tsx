import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { getClientById } from "@/lib/mock/clients";
import type { Invoice } from "@/lib/mock/invoices";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";

export function InvoiceRow({ invoice, showClient = true }: { invoice: Invoice; showClient?: boolean }) {
  const client = getClientById(invoice.clientId);

  return (
    <Link
      href={`/invoices/${invoice.id}`}
      className={cn(
        "grid grid-cols-1 gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:items-center sm:gap-4 sm:px-5",
        showClient ? "sm:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]" : "sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showClient && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
            {getInitials(client?.nombreComercial ?? "??")}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{invoice.numero}</p>
          <p className="truncate text-xs text-slate-500">
            {showClient ? client?.nombreComercial ?? "Cliente no encontrado" : invoice.concepto}
          </p>
        </div>
      </div>

      {showClient && (
        <div className="min-w-0 text-sm text-slate-600 sm:truncate">
          <span className="text-slate-400 sm:hidden">Emisión: </span>
          {invoice.fechaEmision ? formatDate(invoice.fechaEmision) : "Sin emitir"}
        </div>
      )}

      <div className="min-w-0 text-sm text-slate-600 sm:truncate">
        <span className="text-slate-400 sm:hidden">Vencimiento: </span>
        {invoice.fechaVencimiento ? formatDate(invoice.fechaVencimiento) : "—"}
      </div>

      <div className="min-w-0 text-sm font-medium text-slate-800 sm:truncate">
        <span className="font-normal text-slate-400 sm:hidden">Importe: </span>
        {formatCurrency(invoice.total)}
      </div>

      <div className="min-w-0 text-sm sm:truncate">
        <span className="text-slate-400 sm:hidden">Saldo pendiente: </span>
        <span className={cn("font-medium", invoice.saldoPendiente > 0 ? "text-rose-600" : "text-slate-500")}>
          {formatCurrency(invoice.saldoPendiente)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <InvoiceStatusBadge status={invoice.estado} />
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
      </div>
    </Link>
  );
}
