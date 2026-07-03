import { Header } from "@/components/layout/Header";
import { ReportsView } from "@/app/(app)/reports/ReportsView";
import { hourEntries } from "@/lib/mock/hours";
import { invoices } from "@/lib/mock/invoices";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <>
      <Header title="Reportes" subtitle="Indicadores del negocio y análisis de rentabilidad" />
      <main className="flex-1 p-4 sm:p-6">
        <ReportsView invoices={invoices} hourEntries={hourEntries} />
      </main>
    </>
  );
}
