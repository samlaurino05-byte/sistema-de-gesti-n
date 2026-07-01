import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityItemProps = {
  icon: LucideIcon;
  title: string;
  meta: string;
  time: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneStyles: Record<NonNullable<ActivityItemProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
};

export function ActivityItem({ icon: Icon, title, meta, time, tone = "default" }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", toneStyles[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{title}</p>
        <p className="truncate text-xs text-slate-500">{meta}</p>
      </div>
      <span className="shrink-0 text-xs text-slate-400">{time}</span>
    </div>
  );
}
