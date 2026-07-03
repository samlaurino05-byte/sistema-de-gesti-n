import { Header } from "@/components/layout/Header";
import { SettingsView } from "@/app/(app)/settings/SettingsView";
import type { SettingsTabId } from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

const validTabs: SettingsTabId[] = ["estudio", "usuarios", "facturacion", "horas", "preferencias"];

function isSettingsTabId(value: string | undefined): value is SettingsTabId {
  return validTabs.includes(value as SettingsTabId);
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = isSettingsTabId(tab) ? tab : "estudio";

  return (
    <>
      <Header title="Configuración" subtitle="Centro de configuración del estudio" />
      <main className="flex-1 p-4 sm:p-6">
        <SettingsView initialTab={initialTab} />
      </main>
    </>
  );
}
