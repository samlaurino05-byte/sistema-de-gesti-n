import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
};

export function StatCard({ label, value, change, trend = "neutral", icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4.5 w-4.5 text-slate-600" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-red-600",
            trend === "neutral" && "text-slate-400"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
