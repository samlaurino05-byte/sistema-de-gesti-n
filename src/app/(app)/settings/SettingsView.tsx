"use client";

import { useState } from "react";
import { Banknote, Building2, Clock3, SlidersHorizontal, Users } from "lucide-react";
import { SettingsTabs, type SettingsTab, type SettingsTabId } from "@/components/settings/SettingsTabs";
import { StudioProfileCard } from "@/components/settings/StudioProfileCard";
import { UsersSection } from "@/components/settings/UsersSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { HoursSection } from "@/components/settings/HoursSection";
import { PreferencesSection } from "@/components/settings/PreferencesSection";

const tabs: SettingsTab[] = [
  { id: "estudio", label: "Estudio", icon: Building2 },
  { id: "usuarios", label: "Usuarios y roles", icon: Users },
  { id: "facturacion", label: "Facturación", icon: Banknote },
  { id: "horas", label: "Horas y costos", icon: Clock3 },
  { id: "preferencias", label: "Preferencias", icon: SlidersHorizontal },
];

export function SettingsView({ initialTab = "estudio" }: { initialTab?: SettingsTabId }) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Configuración</h2>
        <p className="mt-1 text-sm text-slate-500">Centro de configuración del estudio</p>
      </section>

      <SettingsTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "estudio" && <StudioProfileCard />}
        {activeTab === "usuarios" && <UsersSection />}
        {activeTab === "facturacion" && <BillingSection />}
        {activeTab === "horas" && <HoursSection />}
        {activeTab === "preferencias" && <PreferencesSection />}
      </div>
    </div>
  );
}
