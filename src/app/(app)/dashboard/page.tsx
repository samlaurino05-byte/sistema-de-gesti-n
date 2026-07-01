import { DollarSign, TrendingDown, Wallet, FileClock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/ui/StatCard";

const stats = [
  {
    label: "Ingresos del mes",
    value: "$0,00",
    change: "Sin movimientos registrados",
    trend: "neutral" as const,
    icon: DollarSign,
  },
  {
    label: "Egresos del mes",
    value: "$0,00",
    change: "Sin movimientos registrados",
    trend: "neutral" as const,
    icon: TrendingDown,
  },
  {
    label: "Balance",
    value: "$0,00",
    change: "Sin movimientos registrados",
    trend: "neutral" as const,
    icon: Wallet,
  },
  {
    label: "Facturas pendientes",
    value: "0",
    change: "Módulo de facturación no disponible",
    trend: "neutral" as const,
    icon: FileClock,
  },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" subtitle="Resumen general de la actividad contable" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Evolución de ingresos y egresos
            </h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              Sin datos para graficar todavía
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              No hay actividad reciente
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
