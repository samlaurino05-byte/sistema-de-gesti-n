import Link from "next/link";
import { cn } from "@/lib/utils";

type RankingItem = {
  key: string;
  label: string;
  value: number;
  href?: string;
};

export function RankingBarList({
  items,
  colorClassName = "bg-indigo-500",
  valueFormatter,
}: {
  items: RankingItem[];
  colorClassName?: string;
  valueFormatter: (value: number) => string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">Sin datos para el período seleccionado.</p>;
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const width = Math.max((item.value / max) * 100, 3);
        const content = (
          <>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-medium text-slate-800">{item.label}</span>
              <span className="shrink-0 font-semibold text-slate-900">{valueFormatter(item.value)}</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={cn("h-full rounded-full", colorClassName)} style={{ width: `${width}%` }} />
            </div>
          </>
        );

        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={item.href} className="-m-1 block rounded-lg p-1 transition-colors hover:bg-slate-50">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
