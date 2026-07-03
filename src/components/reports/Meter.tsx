import { cn } from "@/lib/utils";

export function Meter({ value, toneClassName = "bg-indigo-500" }: { value: number; toneClassName?: string }) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full", toneClassName)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
