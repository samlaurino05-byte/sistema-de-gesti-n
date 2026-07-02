import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TimelineItemProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  date: string;
  tone?: "default" | "success" | "warning" | "danger";
  isLast?: boolean;
};

const toneStyles: Record<NonNullable<TimelineItemProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
};

export function TimelineItem({
  icon: Icon,
  title,
  description,
  date,
  tone = "default",
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", toneStyles[tone])}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-slate-200" />}
      </div>
      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <span className="shrink-0 text-xs text-slate-400">{date}</span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
    </div>
  );
}
