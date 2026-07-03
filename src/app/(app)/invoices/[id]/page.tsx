import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, Calendar, FileText, Percent, Wallet } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { AiPanel } from "@/components/ui/AiPanel";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { QuickActionsGrid } from "@/components/ui/QuickActionsGrid";
import { InvoiceWorkspaceHeader } from "@/components/invoices/InvoiceWorkspaceHeader";
import { HourRow } from "@/components/hours/HourRow";
import { HourTableHead } from "@/components/hours/HourTableHead";
import { CollectionStatusBadge } from "@/components/collections/CollectionStatusBadge";
import { getClientById } from "@/lib/mock/clients";
import { getCollectionForInvoice, suggestedChannelLabels } from "@/lib/mock/collections";
import {
  getInvoiceAiInsights,
  getInvoiceById,
  getInvoiceHourEntries,
  getInvoiceTimeline,
  invoiceQuickActions,
  invoices,
} from "@/lib/mock/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return invoices.map((invoice) => ({ id: invoice.id }));
}

export default async function InvoiceWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const client = getClientById(invoice.clientId);

  if (!client) {
    notFound();
  }

  const timeline = getInvoiceTimeline(invoice);
  const hourEntries = getInvoiceHourEntries(invoice);
  const aiSuggestions = getInvoiceAiInsights(invoice).map((text) => ({ text }));
  const collection = getCollectionForInvoice(invoice);

  return (
    <>
      <Header title={invoice.numero} subtitle="Workspace de factura" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Facturación
        </Link>

        <InvoiceWorkspaceHeader invoice={invoice} client={client} />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Subtotal" value={formatCurrency(invoice.subtotal)} icon={FileText} tone="default" />
          <MetricCard label="IVA (21%)" value={formatCurrency(invoice.iva)} icon={Percent} tone="default" />
          <MetricCard label="Total" value={formatCurrency(invoice.total)} icon={Banknote} tone="default" />
          <MetricCard
            label="Saldo pendiente"
            value={formatCurrency(invoice.saldoPendiente)}
            icon={Wallet}
            tone={invoice.saldoPendiente > 0 ? "danger" : "success"}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Datos de la factura</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-slate-400">Concepto</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{invoice.concepto}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="h-3.5 w-3.5" /> Fecha de emisión
                  </dt>
                  <dd className="mt-0.5 text-sm capitalize text-slate-800">
                    {invoice.fechaEmision ? formatDate(invoice.fechaEmision) : "Sin emitir"}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="h-3.5 w-3.5" /> Fecha de vencimiento
                  </dt>
                  <dd className="mt-0.5 text-sm capitalize text-slate-800">
                    {invoice.fechaVencimiento ? formatDate(invoice.fechaVencimiento) : "Sin definir"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400">Cliente asociado</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">
                    <Link href={`/clients/${client.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      {client.nombreComercial}
                    </Link>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
              <div className="mt-4">
                {timeline.map((entry, index) => (
                  <TimelineItem key={entry.id} {...entry} isLast={index === timeline.length - 1} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <h3 className="text-sm font-semibold text-slate-900">Horas incluidas</h3>
                <span className="text-xs text-slate-500">{hourEntries.length} registros</span>
              </div>
              {hourEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse">
                    <HourTableHead showClient={false} />
                    <tbody>
                      {hourEntries.map((entry) => (
                        <HourRow key={entry.id} entry={entry} showClient={false} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-5 pt-0 text-sm text-slate-500 sm:p-6 sm:pt-0">
                  Esta factura no tiene horas asociadas — corresponde a honorarios fijos.
                </p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {collection && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">Estado de cobranza</h3>
                  <CollectionStatusBadge status={collection.estadoCobranza} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">Días de mora</dt>
                    <dd className="font-medium text-slate-800">
                      {collection.diasMora > 0 ? `${collection.diasMora} d` : "Sin vencer"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">Canal sugerido</dt>
                    <dd className="font-medium text-slate-800">{suggestedChannelLabels[collection.canalSugerido]}</dd>
                  </div>
                </dl>
                <Link
                  href={`/collections?cliente=${client.id}`}
                  className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Ver en Cobranzas
                </Link>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Acciones rápidas</h3>
              <div className="mt-3">
                <QuickActionsGrid actions={invoiceQuickActions} />
              </div>
            </section>

            <AiPanel suggestions={aiSuggestions} />
          </div>
        </div>
      </main>
    </>
  );
}
