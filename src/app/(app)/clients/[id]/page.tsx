import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Clock3,
  CreditCard,
  Mail,
  MessagesSquare,
  Phone,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { AiPanel } from "@/components/ui/AiPanel";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { DocumentRow } from "@/components/ui/DocumentRow";
import { QuickActionsGrid } from "@/components/ui/QuickActionsGrid";
import { ClientWorkspaceHeader } from "@/components/clients/ClientWorkspaceHeader";
import { HourRow } from "@/components/hours/HourRow";
import { HourTableHead } from "@/components/hours/HourTableHead";
import { InvoiceRow } from "@/components/invoices/InvoiceRow";
import { ClientCollectionSummary } from "@/components/collections/ClientCollectionSummary";
import {
  clients,
  getClientAiInsights,
  getClientById,
  getClientCommunications,
  getClientDocuments,
  getClientTimeline,
  quickActions,
} from "@/lib/mock/clients";
import { getCollectionSummaryForClient } from "@/lib/mock/collections";
import { getHoursForClient, summarizeHours } from "@/lib/mock/hours";
import { getInvoicesForClient, invoices, summarizeInvoices } from "@/lib/mock/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return clients.map((client) => ({ id: client.id }));
}

export default async function ClientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) {
    notFound();
  }

  const timeline = getClientTimeline(client);
  const documents = getClientDocuments(client);
  const communications = getClientCommunications(client);
  const aiSuggestions = getClientAiInsights(client).map((text) => ({ text }));
  const hourEntries = getHoursForClient(client.id);
  const hoursSummary = summarizeHours(hourEntries);
  const clientInvoices = getInvoicesForClient(client.id);
  const invoicesSummary = summarizeInvoices(clientInvoices);
  const collectionSummary = getCollectionSummaryForClient(client.id, invoices);

  return (
    <>
      <Header title={client.nombreComercial} subtitle="Workspace del cliente" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Clientes
        </Link>

        <ClientWorkspaceHeader client={client} />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Valor hora" value={formatCurrency(client.valorHora)} icon={Clock3} tone="default" />
          <MetricCard
            label="Deuda pendiente"
            value={formatCurrency(client.deudaPendiente)}
            icon={Wallet}
            tone={client.deudaPendiente > 0 ? "danger" : "success"}
          />
          <MetricCard
            label="Facturación mensual"
            value={formatCurrency(client.facturacionMensual)}
            icon={Banknote}
            tone="default"
          />
          <MetricCard label="Condición de pago" value={client.condicionPago} icon={CreditCard} tone="default" />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Datos fiscales</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-400">CUIT</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{client.cuit}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400">Condición fiscal</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{client.condicionFiscal}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </dt>
                  <dd className="mt-0.5 truncate text-sm text-slate-800">{client.email}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> Teléfono
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{client.telefono}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="h-3.5 w-3.5" /> Fecha de alta
                  </dt>
                  <dd className="mt-0.5 text-sm capitalize text-slate-800">{formatDate(client.fechaAlta)}</dd>
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

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Documentos</h3>
              <div className="mt-2 divide-y divide-slate-100">
                {documents.map((document) => (
                  <DocumentRow key={document.id} document={document} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <h3 className="text-sm font-semibold text-slate-900">Resumen de horas</h3>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>
                    Horas: <strong className="text-slate-800">{hoursSummary.horas} h</strong>
                  </span>
                  <span>
                    Facturación: <strong className="text-slate-800">{formatCurrency(hoursSummary.facturacion)}</strong>
                  </span>
                  <span>
                    Margen: <strong className="text-slate-800">{formatCurrency(hoursSummary.margen)}</strong>
                  </span>
                </div>
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
                  Todavía no hay horas registradas para este cliente.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <h3 className="text-sm font-semibold text-slate-900">Facturas</h3>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>
                    Comprobantes: <strong className="text-slate-800">{clientInvoices.length}</strong>
                  </span>
                  <span>
                    Facturado: <strong className="text-slate-800">{formatCurrency(invoicesSummary.totalFacturado)}</strong>
                  </span>
                  <span>
                    Pendiente:{" "}
                    <strong className="text-slate-800">
                      {formatCurrency(invoicesSummary.pendienteCobro + invoicesSummary.vencido)}
                    </strong>
                  </span>
                </div>
              </div>
              {clientInvoices.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {clientInvoices.map((invoice) => (
                    <InvoiceRow key={invoice.id} invoice={invoice} showClient={false} />
                  ))}
                </div>
              ) : (
                <p className="p-5 pt-0 text-sm text-slate-500 sm:p-6 sm:pt-0">
                  Todavía no hay facturas emitidas para este cliente.
                </p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Acciones rápidas</h3>
              <div className="mt-3">
                <QuickActionsGrid actions={quickActions} />
              </div>
            </section>

            <ClientCollectionSummary group={collectionSummary} />

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">Comunicaciones</h3>
              </div>
              <div className="mt-2 divide-y divide-slate-100">
                {communications.map((comm) => {
                  const Icon = comm.icon;
                  return (
                    <div key={comm.id} className="flex items-start gap-3 py-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{comm.subject}</p>
                        <p className="truncate text-xs text-slate-500">{comm.summary}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">{comm.date}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <AiPanel suggestions={aiSuggestions} />
          </div>
        </div>
      </main>
    </>
  );
}
