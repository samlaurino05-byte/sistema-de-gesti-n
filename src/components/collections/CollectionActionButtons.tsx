import { Banknote, Flag, Megaphone, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Registrar pago", icon: Banknote },
  { label: "Enviar recordatorio", icon: Send },
  { label: "Generar reclamo", icon: Megaphone },
  { label: "Marcar seguimiento", icon: Flag },
];

export function CollectionActionButtons() {
  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled
            title="Próximamente"
            aria-label={action.label}
            className="flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
