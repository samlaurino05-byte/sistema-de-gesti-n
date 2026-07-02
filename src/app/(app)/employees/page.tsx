import { Header } from "@/components/layout/Header";
import { EmployeesView } from "@/app/(app)/employees/EmployeesView";
import { employees } from "@/lib/mock/employees";
import { hourEntries } from "@/lib/mock/hours";

export const dynamic = "force-dynamic";

export default function EmployeesPage() {
  return (
    <>
      <Header title="Empleados" subtitle="Equipo, horas y costo laboral" />
      <main className="flex-1 p-4 sm:p-6">
        <EmployeesView employees={employees} hourEntries={hourEntries} />
      </main>
    </>
  );
}
