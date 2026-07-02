import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MessagesSquare,
  Phone,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { AiPanel } from "@/components/ui/AiPanel";
import { ClientWorkspaceHeader } from "@/components/clients/ClientWorkspaceHeader";
import { ClientTimelineItem } from "@/components/clients/ClientTimelineItem";
import {
  clients,
  getClientAiInsights,
  getClientById,
  getClientCommunications,
  getClientDocuments,
  getClientTimeline,
  quickActions,
} from "@/lib/mock/clients";
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
                  <ClientTimelineItem key={entry.id} {...entry} isLast={index === timeline.length - 1} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Documentos</h3>
              <div className="mt-2 divide-y divide-slate-100">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{document.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {document.type} · {document.size} · {document.date}
                      </p>
                    </div>
                    <span
                      className="shrink-0 cursor-not-allowed text-xs font-semibold text-slate-300"
                      title="Próximamente"
                    >
                      Ver
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Acciones rápidas</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      disabled
                      title="Próximamente"
                      className="flex cursor-not-allowed flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-slate-400"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium leading-tight">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

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
