import type { LucideIcon } from "lucide-react";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";

type ActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  cta: string;
  enabled?: boolean;
  urgent?: boolean;
};

export function ActionCard({
  title,
  description,
  icon: Icon,
  cta,
  enabled = false,
  urgent = false,
}: ActionCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border bg-white p-4 shadow-sm transition-all",
        enabled ? "border-slate-200 hover:-translate-y-0.5 hover:shadow-md" : "border-slate-200"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              urgent ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          {!enabled && <StatusBadge label="Próximamente" variant="neutral" />}
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        disabled={!enabled}
        title={enabled ? cta : "Próximamente"}
        className={cn(
          "mt-4 flex items-center gap-1 text-xs font-semibold",
          enabled ? "text-indigo-600 hover:text-indigo-700" : "cursor-not-allowed text-slate-300"
        )}
      >
        {enabled ? (
          <>
            {cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            {cta}
            <Lock className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}
