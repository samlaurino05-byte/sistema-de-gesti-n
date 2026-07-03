import { Header } from "@/components/layout/Header";
import { CollectionsView } from "@/app/(app)/collections/CollectionsView";
import { getClientById } from "@/lib/mock/clients";
import { invoices } from "@/lib/mock/invoices";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const initialClient = cliente ? getClientById(cliente) : undefined;

  return (
    <>
      <Header title="Cobranzas" subtitle="Centro operativo de seguimiento de pagos pendientes" />
      <main className="flex-1 p-4 sm:p-6">
        <CollectionsView invoices={invoices} initialSearch={initialClient?.nombreComercial} />
      </main>
    </>
  );
}
