import { CalendarDays, ListChecks, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { ActionCard } from "@/components/ui/ActionCard";
import { ActivityItem } from "@/components/ui/ActivityItem";
import { AiPanel } from "@/components/ui/AiPanel";
import { QuickAccessCard } from "@/components/ui/QuickAccessCard";
import { cn } from "@/lib/utils";
import {
  aiSuggestions,
  alerts,
  currentUser,
  metrics,
  quickAccess,
  recentActivity,
  suggestedTasks,
} from "@/lib/mock/dashboard";

export const dynamic = "force-dynamic";

const alertToneClasses: Record<string, string> = {
  danger: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-indigo-50 text-indigo-600",
};

function getGreeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const formattedDate = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <>
      <Header title="Centro de Operaciones" subtitle="Resumen general de la actividad contable" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {greeting}, {currentUser.name.split(" ")[0]} 👋
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tenés {alerts.length} alertas y {suggestedTasks.length} tareas sugeridas para hoy.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm capitalize text-slate-400">
              <CalendarDays className="h-4 w-4" />
              {formattedDate}
            </div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Alertas importantes</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      alertToneClasses[alert.variant]
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{alert.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{alert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section>
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">Tareas sugeridas</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {suggestedTasks.map((task) => (
                  <ActionCard key={task.id} {...task} enabled={false} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Actividad reciente</h3>
              <div className="mt-2 divide-y divide-slate-100">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <AiPanel suggestions={aiSuggestions} />

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">Accesos rápidos</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickAccess.map((item) => (
                  <QuickAccessCard key={item.href} {...item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
