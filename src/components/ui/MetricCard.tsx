import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneStyles: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-rose-50 text-rose-600",
};

const trendStyles: Record<NonNullable<MetricCardProps["trend"]>, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  neutral: "text-slate-400",
};

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export function MetricCard({
  label,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  tone = "default",
}: MetricCardProps) {
  const TrendIcon = trendIcons[trend];

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneStyles[tone])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {change && (
        <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", trendStyles[trend])}>
          <TrendIcon className="h-3.5 w-3.5" />
          {change}
        </p>
      )}
    </div>
  );
}
