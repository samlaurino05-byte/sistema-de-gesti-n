import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Clock3,
  IdCard,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/ui/MetricCard";
import { AiPanel } from "@/components/ui/AiPanel";
import { TimelineItem } from "@/components/ui/TimelineItem";
import { DocumentRow } from "@/components/ui/DocumentRow";
import { QuickActionsGrid } from "@/components/ui/QuickActionsGrid";
import { ClientRow } from "@/components/clients/ClientRow";
import { EmployeeWorkspaceHeader } from "@/components/employees/EmployeeWorkspaceHeader";
import { HourRow } from "@/components/hours/HourRow";
import { HourTableHead } from "@/components/hours/HourTableHead";
import {
  employeeQuickActions,
  getEmployeeAiInsights,
  getEmployeeDocuments,
  getEmployeeObservations,
  getEmployeeTimeline,
} from "@/lib/mock/employees";
import { getHoursForEmployee, summarizeHours } from "@/lib/mock/hours";
import { getEmployeeBySlugForOrganization } from "@/lib/data/employees";
import { getClientsAssignedToEmployee } from "@/lib/data/clients";
import { requireActiveSession } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Sin generateStaticParams: mismo motivo que Clientes (Sprint 8.3) — el
// empleado se resuelve contra la organización activa de la sesión, que
// solo existe en request time, no en build time.

export default async function EmployeeWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireActiveSession();

  let employee;
  let assignedClients;
  try {
    employee = await getEmployeeBySlugForOrganization(id, session.organizationId);
    assignedClients = employee ? await getClientsAssignedToEmployee(employee.id, session.organizationId) : [];
  } catch (error) {
    console.error(`No se pudo cargar el empleado "${id}":`, error);
    return (
      <>
        <Header title="Empleados" subtitle="Workspace del empleado" />
        <main className="flex-1 p-4 sm:p-6">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Empleados
          </Link>
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se pudo cargar este empleado</p>
            <p className="mt-1 text-xs text-slate-400">Probá recargar la página en unos segundos.</p>
          </div>
        </main>
      </>
    );
  }

  if (!employee) {
    notFound();
  }

  const hourEntries = getHoursForEmployee(employee.id);
  const hoursSummary = summarizeHours(hourEntries);
  const timeline = getEmployeeTimeline(employee);
  const documents = getEmployeeDocuments(employee);
  const observations = getEmployeeObservations(employee);
  const aiSuggestions = getEmployeeAiInsights(employee, assignedClients.length).map((text) => ({ text }));

  return (
    <>
      <Header title={employee.nombre} subtitle="Workspace del empleado" />

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Empleados
        </Link>

        <EmployeeWorkspaceHeader employee={employee} />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Valor hora interno"
            value={formatCurrency(employee.valorHoraInterno)}
            icon={Clock3}
            tone="default"
          />
          <MetricCard
            label="Clientes asignados"
            value={String(assignedClients.length)}
            icon={Users}
            tone={assignedClients.length > 0 ? "success" : "default"}
          />
          <MetricCard label="Horas registradas" value={`${hoursSummary.horas} h`} icon={Clock3} tone="default" />
          <MetricCard
            label="Costo laboral generado"
            value={formatCurrency(hoursSummary.costo)}
            icon={Banknote}
            tone="default"
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Datos personales</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <IdCard className="h-3.5 w-3.5" /> CUIL
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{employee.cuil}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> Teléfono
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{employee.telefono}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <MapPin className="h-3.5 w-3.5" /> Dirección
                  </dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{employee.direccion}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Datos laborales</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-400">Cargo</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{employee.cargo}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400">Área</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{employee.area}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-400">Condición contractual</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">{employee.condicionContractual}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="h-3.5 w-3.5" /> Fecha de ingreso
                  </dt>
                  <dd className="mt-0.5 text-sm capitalize text-slate-800">{formatDate(employee.fechaIngreso)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">Clientes asignados</h3>
              {assignedClients.length > 0 ? (
                <div className="mt-2 divide-y divide-slate-100">
                  {assignedClients.map((client) => (
                    <ClientRow key={client.id} client={client} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Este empleado no tiene clientes asignados.</p>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <h3 className="p-5 pb-0 text-sm font-semibold text-slate-900 sm:p-6 sm:pb-0">Horas registradas</h3>
              {hourEntries.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse">
                    <HourTableHead showEmployee={false} />
                    <tbody>
                      {hourEntries.map((entry) => (
                        <HourRow key={entry.id} entry={entry} showEmployee={false} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-5 pt-3 text-sm text-slate-500 sm:p-6 sm:pt-3">
                  No hay horas registradas para este empleado.
                </p>
              )}
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
              <h3 className="text-sm font-semibold text-slate-900">Documentación</h3>
              <div className="mt-2 divide-y divide-slate-100">
                {documents.map((document) => (
                  <DocumentRow key={document.id} document={document} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Acciones rápidas</h3>
              <div className="mt-3">
                <QuickActionsGrid actions={employeeQuickActions} />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Observaciones RRHH</h3>
              <div className="mt-2 divide-y divide-slate-100">
                {observations.map((observation) => (
                  <div key={observation.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700">{observation.author}</p>
                      <span className="shrink-0 text-xs text-slate-400">{observation.date}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{observation.content}</p>
                  </div>
                ))}
              </div>
            </section>

            <AiPanel suggestions={aiSuggestions} />
          </div>
        </div>
      </main>
    </>
  );
}
