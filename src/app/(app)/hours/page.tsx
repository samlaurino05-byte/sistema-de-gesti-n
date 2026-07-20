import { Header } from "@/components/layout/Header";
import { HoursView } from "@/app/(app)/hours/HoursView";
import { getHourEntriesForOrganization } from "@/lib/data/hours";
import { getEmployeesForOrganization } from "@/lib/data/employees";
import { getClientsForOrganization } from "@/lib/data/clients";
import { requireActiveSession } from "@/lib/auth/session";
import type { HourEntry } from "@/lib/mock/hours";
import type { Employee } from "@/lib/mock/employees";
import type { Client } from "@/lib/mock/clients";

export const dynamic = "force-dynamic";

export default async function HoursPage() {
  const session = await requireActiveSession();

  let hourEntries: HourEntry[] = [];
  let employees: Employee[] = [];
  let clients: Client[] = [];
  let loadError = false;

  try {
    [hourEntries, employees, clients] = await Promise.all([
      getHourEntriesForOrganization(session.organizationId),
      getEmployeesForOrganization(session.organizationId),
      getClientsForOrganization(session.organizationId),
    ]);
  } catch (error) {
    console.error("No se pudo cargar el registro de horas:", error);
    loadError = true;
  }

  return (
    <>
      <Header title="Horas" subtitle="Registro de horas trabajadas por el equipo" />
      <main className="flex-1 p-4 sm:p-6">
        {loadError ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se pudo cargar el registro de horas</p>
            <p className="mt-1 text-xs text-slate-400">Probá recargar la página en unos segundos.</p>
          </div>
        ) : (
          <HoursView hourEntries={hourEntries} employees={employees} clients={clients} />
        )}
      </main>
    </>
  );
}
