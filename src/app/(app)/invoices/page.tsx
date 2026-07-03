import { Header } from "@/components/layout/Header";
import { InvoicesView } from "@/app/(app)/invoices/InvoicesView";
import { invoices } from "@/lib/mock/invoices";

export const dynamic = "force-dynamic";

export default function InvoicesPage() {
  return (
    <>
      <Header title="Facturación" subtitle="Comprobantes emitidos y estado de cobro" />
      <main className="flex-1 p-4 sm:p-6">
        <InvoicesView invoices={invoices} />
      </main>
    </>
  );
}
