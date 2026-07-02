import type { LucideIcon } from "lucide-react";

export type QuickAction = {
  label: string;
  icon: LucideIcon;
};

export function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled
            title="Próximamente"
            className="flex cursor-not-allowed flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-slate-400"
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium leading-tight">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
