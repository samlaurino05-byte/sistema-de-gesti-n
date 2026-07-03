"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { systemPreferences, type SystemPreferenceKey } from "@/lib/mock/settings";

export function PreferencesSection() {
  const [values, setValues] = useState<Record<SystemPreferenceKey, boolean>>(() =>
    Object.fromEntries(systemPreferences.map((preference) => [preference.key, preference.defaultValue])) as Record<
      SystemPreferenceKey,
      boolean
    >
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Preferencias del sistema</h2>
        <p className="mt-1 text-sm text-slate-500">Notificaciones y alertas activas para todo el estudio</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="divide-y divide-slate-100">
          {systemPreferences.map((preference) => (
            <ToggleSwitch
              key={preference.key}
              checked={values[preference.key]}
              onChange={(checked) => setValues((current) => ({ ...current, [preference.key]: checked }))}
              label={preference.label}
              description={preference.description}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
