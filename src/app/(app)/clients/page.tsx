import { Header } from "@/components/layout/Header";
import { ClientsView } from "@/app/(app)/clients/ClientsView";
import { clients } from "@/lib/mock/clients";

export const dynamic = "force-dynamic";

export default function ClientsPage() {
  return (
    <>
      <Header title="Clientes" subtitle="Cartera de clientes y estado de cuenta" />
      <main className="flex-1 p-4 sm:p-6">
        <ClientsView clients={clients} />
      </main>
    </>
  );
}
