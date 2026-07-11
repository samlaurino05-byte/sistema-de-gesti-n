import { Header } from "@/components/layout/Header";
import { ClientsView } from "@/app/(app)/clients/ClientsView";
import { getClientsForOrganization } from "@/lib/data/clients";
import { requireActiveSession } from "@/lib/auth/session";
import type { Client } from "@/lib/mock/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const session = await requireActiveSession();

  let clients: Client[] = [];
  let loadError = false;

  try {
    clients = await getClientsForOrganization(session.organizationId);
  } catch (error) {
    console.error("No se pudo cargar la cartera de clientes:", error);
    loadError = true;
  }

  return (
    <>
      <Header title="Clientes" subtitle="Cartera de clientes y estado de cuenta" />
      <main className="flex-1 p-4 sm:p-6">
        {loadError ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se pudo cargar la cartera de clientes</p>
            <p className="mt-1 text-xs text-slate-400">Probá recargar la página en unos segundos.</p>
          </div>
        ) : (
          <ClientsView clients={clients} />
        )}
      </main>
    </>
  );
}
