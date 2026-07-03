import Link from "next/link";
import { Building2, Calendar } from "lucide-react";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import type { Client } from "@/lib/mock/clients";
import type { Invoice } from "@/lib/mock/invoices";
import { formatDate, getInitials } from "@/lib/utils";

export function InvoiceWorkspaceHeader({ invoice, client }: { invoice: Invoice; client: Client }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-semibold text-white">
            {getInitials(client.nombreComercial)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">{invoice.numero}</h1>
              <InvoiceStatusBadge status={invoice.estado} />
            </div>
            <Link
              href={`/clients/${client.id}`}
              className="mt-1 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Building2 className="h-3.5 w-3.5" />
              {client.nombreComercial}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400">Vence:</span>
          <span className="font-medium text-slate-900">
            {invoice.fechaVencimiento ? formatDate(invoice.fechaVencimiento) : "Sin definir"}
          </span>
        </div>
      </div>
    </section>
  );
}
