import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
};

const variantStyles: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
  info: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

export function StatusBadge({ label, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantStyles[variant]
      )}
    >
      {label}
    </span>
  );
}
