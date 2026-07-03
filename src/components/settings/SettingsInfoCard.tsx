import { Pencil } from "lucide-react";

export type SettingsField = { label: string; value: string };

export function SettingsInfoCard({
  title,
  description,
  fields,
}: {
  title: string;
  description?: string;
  fields: SettingsField[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs font-medium text-slate-400">{field.label}</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
