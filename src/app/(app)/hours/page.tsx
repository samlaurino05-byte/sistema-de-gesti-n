import { Header } from "@/components/layout/Header";
import { HoursView } from "@/app/(app)/hours/HoursView";
import { clients } from "@/lib/mock/clients";
import { employees } from "@/lib/mock/employees";
import { hourEntries } from "@/lib/mock/hours";

export const dynamic = "force-dynamic";

export default function HoursPage() {
  return (
    <>
      <Header title="Horas" subtitle="Registro de horas trabajadas por el equipo" />
      <main className="flex-1 p-4 sm:p-6">
        <HoursView hourEntries={hourEntries} employees={employees} clients={clients} />
      </main>
    </>
  );
}
