"use client";

import { useState } from "react";
import { SettingsInfoCard } from "@/components/settings/SettingsInfoCard";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { hoursSettings } from "@/lib/mock/settings";
import { formatCurrency } from "@/lib/utils";

export function HoursSection() {
  const [permitirHorasAdicionales, setPermitirHorasAdicionales] = useState(hoursSettings.permitirHorasAdicionales);
  const [requerirAprobacionHoras, setRequerirAprobacionHoras] = useState(hoursSettings.requerirAprobacionHoras);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Horas y costos</h2>
        <p className="mt-1 text-sm text-slate-500">Valores por defecto para la carga de horas y el cálculo de costos</p>
      </section>

      <SettingsInfoCard
        title="Valores por defecto"
        description="Se aplican como sugerencia al cargar nuevas horas — coherentes con employees.ts y hours.ts"
        fields={[
          { label: "Jornada laboral estándar", value: `${hoursSettings.jornadaEstandarHoras} h por día` },
          { label: "Valor hora interno por defecto", value: formatCurrency(hoursSettings.valorHoraInternoPorDefecto) },
          {
            label: "Valor hora facturable por defecto",
            value: formatCurrency(hoursSettings.valorHoraFacturablePorDefecto),
          },
          { label: "Objetivo de productividad", value: `${hoursSettings.objetivoProductividad}%` },
        ]}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-slate-900">Reglas de carga de horas</h3>
        <p className="mt-0.5 text-xs text-slate-500">Controlan el flujo de aprobación descrito en Horas</p>

        <div className="mt-2 divide-y divide-slate-100">
          <ToggleSwitch
            checked={permitirHorasAdicionales}
            onChange={setPermitirHorasAdicionales}
            label="Permitir horas adicionales"
            description="Habilita cargar horas por encima de la jornada estándar en un mismo día."
          />
          <ToggleSwitch
            checked={requerirAprobacionHoras}
            onChange={setRequerirAprobacionHoras}
            label="Requerir aprobación de horas"
            description='Las horas cargadas quedan en estado "Pendiente" hasta ser aprobadas antes de facturarse.'
          />
        </div>
      </section>
    </div>
  );
}
