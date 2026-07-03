"use client";

import { cn } from "@/lib/utils";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-indigo-600" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
