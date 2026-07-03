"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Banknote, Scale, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { AiPanel } from "@/components/ui/AiPanel";
import { LineChart } from "@/components/reports/LineChart";
import { DonutChart } from "@/components/reports/DonutChart";
import { RankingBarList } from "@/components/reports/RankingBarList";
import { Meter } from "@/components/reports/Meter";
import type { HourEntry } from "@/lib/mock/hours";
import { summarizeInvoices, type Invoice } from "@/lib/mock/invoices";
import {
  getClientProfitability,
  getHoursByEmployee,
  getMonthlyBilling,
  getReportsAiInsights,
  getReportsSummary,
  getTeamProductivity,
  getTopClientsByBilling,
  getTopClientsByDebt,
  isWithinReportPeriod,
  reportPeriodLabels,
  type ReportPeriod,
} from "@/lib/mock/reports";
import { cn, formatCurrency } from "@/lib/utils";

const periods: ReportPeriod[] = ["mes", "3m", "todo"];

export function ReportsView({ invoices, hourEntries }: { invoices: Invoice[]; hourEntries: HourEntry[] }) {
  const [period, setPeriod] = useState<ReportPeriod>("todo");

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => isWithinReportPeriod(invoice.fechaEmision, period)),
    [invoices, period]
  );
  const filteredHours = useMemo(
    () => hourEntries.filter((entry) => isWithinReportPeriod(entry.fecha, period)),
    [hourEntries, period]
  );

  const summary = useMemo(() => getReportsSummary(filteredInvoices, filteredHours), [filteredInvoices, filteredHours]);
  const collection = useMemo(() => summarizeInvoices(filteredInvoices), [filteredInvoices]);
  const monthlyBilling = useMemo(() => getMonthlyBilling(filteredInvoices), [filteredInvoices]);
  const topBilling = useMemo(() => getTopClientsByBilling(filteredInvoices, 5), [filteredInvoices]);
  const topDebt = useMemo(() => getTopClientsByDebt(filteredInvoices, 5), [filteredInvoices]);
  const hoursByEmployee = useMemo(() => getHoursByEmployee(filteredHours), [filteredHours]);
  const profitability = useMemo(() => getClientProfitability(filteredHours, 6), [filteredHours]);
  const productivity = useMemo(() => getTeamProductivity(filteredHours), [filteredHours]);
  const aiSuggestions = useMemo(
    () => getReportsAiInsights(filteredInvoices, filteredHours).map((text) => ({ text })),
    [filteredInvoices, filteredHours]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Reportes</h2>
          <p className="mt-1 text-sm text-slate-500">Indicadores de facturación, cobranza y productividad</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                period === item ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {reportPeriodLabels[item]}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total facturado" value={formatCurrency(summary.totalFacturado)} icon={Banknote} tone="default" />
        <MetricCard label="Cobrado" value={formatCurrency(summary.cobrado)} icon={Wallet} tone="success" />
        <MetricCard
          label="Pendiente + vencido"
          value={formatCurrency(summary.pendienteMasVencido)}
          icon={AlertTriangle}
          tone={summary.pendienteMasVencido > 0 ? "danger" : "success"}
        />
        <MetricCard label="Margen sobre horas" value={`${summary.margenPct.toFixed(0)}%`} icon={Scale} tone="default" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Facturación mensual</h3>
            <span className="text-xs text-slate-400">Por mes de emisión</span>
          </div>
          <div className="mt-4">
            <LineChart
              data={monthlyBilling.map((point) => ({ label: point.label, value: point.facturado }))}
              valueFormatter={formatCurrency}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900">Cobrado vs. pendiente vs. vencido</h3>
          <div className="mt-4">
            <DonutChart
              centerLabel="Total facturado"
              centerValue={formatCurrency(collection.totalFacturado)}
              segments={[
                { label: "Cobrado", value: collection.cobrado, color: "#10b981" },
                { label: "Pendiente", value: collection.pendienteCobro, color: "#f59e0b" },
                { label: "Vencido", value: collection.vencido, color: "#f43f5e" },
              ]}
            />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900">Clientes con mayor facturación</h3>
          <div className="mt-4">
            <RankingBarList
              items={topBilling.map((entry) => ({
                key: entry.client.id,
                label: entry.client.nombreComercial,
                value: entry.amount,
                href: `/clients/${entry.client.id}`,
              }))}
              colorClassName="bg-indigo-500"
              valueFormatter={formatCurrency}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900">Clientes con mayor deuda</h3>
          <div className="mt-4">
            <RankingBarList
              items={topDebt.map((entry) => ({
                key: entry.client.id,
                label: entry.client.nombreComercial,
                value: entry.amount,
                href: `/collections?cliente=${entry.client.id}`,
              }))}
              colorClassName="bg-rose-500"
              valueFormatter={formatCurrency}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900">Horas trabajadas por empleado</h3>
          <div className="mt-4">
            <RankingBarList
              items={hoursByEmployee.map((entry) => ({
                key: entry.employee.id,
                label: entry.employee.nombre,
                value: entry.horas,
                href: `/employees/${entry.employee.id}`,
              }))}
              colorClassName="bg-indigo-500"
              valueFormatter={(value) => `${value} h`}
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900">Rentabilidad por cliente</h3>
          <p className="mt-0.5 text-xs text-slate-500">Horas cargadas — facturación menos costo interno</p>
        </div>
        {profitability.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="whitespace-nowrap px-4 py-3">Cliente</th>
                  <th className="whitespace-nowrap px-4 py-3">Horas</th>
                  <th className="whitespace-nowrap px-4 py-3">Facturación</th>
                  <th className="whitespace-nowrap px-4 py-3">Costo</th>
                  <th className="whitespace-nowrap px-4 py-3">Margen</th>
                  <th className="whitespace-nowrap px-4 py-3">Margen %</th>
                </tr>
              </thead>
              <tbody>
                {profitability.map((row) => (
                  <tr key={row.client.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Link href={`/clients/${row.client.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                        {row.client.nombreComercial}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{row.horas} h</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(row.facturacion)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(row.costo)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className={cn("font-medium", row.margen >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        {formatCurrency(row.margen)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Meter value={row.margenPct} toneClassName={row.margenPct >= 0 ? "bg-emerald-500" : "bg-rose-500"} />
                        <span className="text-xs font-medium text-slate-600">{row.margenPct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 pt-0 text-sm text-slate-500 sm:p-6 sm:pt-0">Sin horas cargadas en el período seleccionado.</p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-900">Productividad y margen por hora</h3>
            <p className="mt-0.5 text-xs text-slate-500">% de horas aprobadas o facturadas sobre el total cargado</p>
          </div>
          {productivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="whitespace-nowrap px-4 py-3">Empleado</th>
                    <th className="whitespace-nowrap px-4 py-3">Horas</th>
                    <th className="whitespace-nowrap px-4 py-3">Margen / hora</th>
                    <th className="whitespace-nowrap px-4 py-3">Productividad</th>
                  </tr>
                </thead>
                <tbody>
                  {productivity.map((row) => (
                    <tr key={row.employee.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Link href={`/employees/${row.employee.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                          {row.employee.nombre}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{row.horas} h</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{formatCurrency(row.margenPorHora)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Meter value={row.productividad} toneClassName="bg-indigo-500" />
                          <span className="text-xs font-medium text-slate-600">{row.productividad}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-5 pt-0 text-sm text-slate-500 sm:p-6 sm:pt-0">Sin horas cargadas en el período seleccionado.</p>
          )}
        </section>

        <AiPanel suggestions={aiSuggestions} />
      </div>
    </div>
  );
}
