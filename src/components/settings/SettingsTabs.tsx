"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTabId = "estudio" | "usuarios" | "facturacion" | "horas" | "preferencias";

export type SettingsTab = { id: SettingsTabId; label: string; icon: LucideIcon };

export function SettingsTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: SettingsTab[];
  activeTab: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
