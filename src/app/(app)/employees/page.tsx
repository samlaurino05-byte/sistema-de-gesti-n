import { Header } from "@/components/layout/Header";
import { EmployeesView } from "@/app/(app)/employees/EmployeesView";
import { hourEntries } from "@/lib/mock/hours";
import { getEmployeesForOrganization } from "@/lib/data/employees";
import { requireActiveSession } from "@/lib/auth/session";
import type { Employee } from "@/lib/mock/employees";

export const dynamic = "force-dynamic";

// `hourEntries` sigue viniendo del mock: Horas todavía no está migrado
// (fuera de alcance de este sprint). Las métricas de horas/productividad
// del listado son, por lo tanto, datos derivados de mock; el resto
// (identidad, cargo, área, estado, valor hora, cantidad de empleados) es
// real desde Prisma.
export default async function EmployeesPage() {
  const session = await requireActiveSession();

  let employees: Employee[] = [];
  let loadError = false;

  try {
    employees = await getEmployeesForOrganization(session.organizationId);
  } catch (error) {
    console.error("No se pudo cargar el equipo de empleados:", error);
    loadError = true;
  }

  return (
    <>
      <Header title="Empleados" subtitle="Equipo, horas y costo laboral" />
      <main className="flex-1 p-4 sm:p-6">
        {loadError ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se pudo cargar el equipo de empleados</p>
            <p className="mt-1 text-xs text-slate-400">Probá recargar la página en unos segundos.</p>
          </div>
        ) : (
          <EmployeesView employees={employees} hourEntries={hourEntries} />
        )}
      </main>
    </>
  );
}
