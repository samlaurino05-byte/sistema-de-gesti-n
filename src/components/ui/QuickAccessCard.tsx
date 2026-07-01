import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickAccessCardProps = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  enabled?: boolean;
};

export function QuickAccessCard({
  label,
  description,
  href,
  icon: Icon,
  enabled = false,
}: QuickAccessCardProps) {
  const content = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          enabled ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {!enabled && <Lock className="h-3 w-3 text-slate-300" />}
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </>
  );

  if (!enabled) {
    return (
      <div
        className="cursor-not-allowed rounded-xl border border-slate-200 bg-white p-4 opacity-60"
        title="Próximamente"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      {content}
    </Link>
  );
}
