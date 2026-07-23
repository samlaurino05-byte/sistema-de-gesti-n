import { Header } from "@/components/layout/Header";
import { CollectionsView } from "@/app/(app)/collections/CollectionsView";
import {
  getCollectionsForOrganization,
  getCollectionsSummaryForOrganization,
  summarizeCollectionsDaily,
  getCollectionsAiInsights,
  type ClientCollectionGroup,
  type CollectionsSummary,
  type CollectionsDailySummary,
} from "@/lib/data/collections";
import { getClientBySlugForOrganization } from "@/lib/data/clients";
import { requireActiveSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const EMPTY_SUMMARY: CollectionsSummary = { totalPendiente: 0, vencido: 0, porVencer: 0, cobradoEsteMes: 0 };
const EMPTY_DAILY_SUMMARY: CollectionsDailySummary = { clientes: 0, criticas: 0, porVencer: 0, enSeguimiento: 0 };

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const session = await requireActiveSession();

  let groups: ClientCollectionGroup[] = [];
  let summary: CollectionsSummary = EMPTY_SUMMARY;
  let dailySummary: CollectionsDailySummary = EMPTY_DAILY_SUMMARY;
  let aiSuggestions: { text: string }[] = [];
  let initialSearch: string | undefined;
  let loadError = false;

  try {
    const [collectionGroups, collectionsSummary, initialClient] = await Promise.all([
      getCollectionsForOrganization(session.organizationId),
      getCollectionsSummaryForOrganization(session.organizationId),
      cliente ? getClientBySlugForOrganization(cliente, session.organizationId) : Promise.resolve(null),
    ]);

    groups = collectionGroups;
    summary = collectionsSummary;
    dailySummary = summarizeCollectionsDaily(collectionGroups);
    aiSuggestions = getCollectionsAiInsights(collectionGroups).map((text) => ({ text }));
    initialSearch = initialClient?.nombreComercial;
  } catch (error) {
    console.error("No se pudo cargar Cobranzas:", error);
    loadError = true;
  }

  return (
    <>
      <Header title="Cobranzas" subtitle="Centro operativo de seguimiento de pagos pendientes" />
      <main className="flex-1 p-4 sm:p-6">
        {loadError ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm font-medium text-slate-600">No se pudo cargar Cobranzas</p>
            <p className="mt-1 text-xs text-slate-400">Probá recargar la página en unos segundos.</p>
          </div>
        ) : (
          <CollectionsView
            groups={groups}
            summary={summary}
            dailySummary={dailySummary}
            aiSuggestions={aiSuggestions}
            initialSearch={initialSearch}
          />
        )}
      </main>
    </>
  );
}
