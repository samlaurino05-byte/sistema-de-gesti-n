type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const gap = 1.5;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
          {total > 0 &&
            segments
              .filter((segment) => segment.value > 0)
              .map((segment) => {
                const fraction = segment.value / total;
                const dash = Math.max(fraction * circumference - gap, 0);
                const strokeDashoffset = -offset;
                offset += fraction * circumference;
                const pct = Math.round(fraction * 100);

                return (
                  <circle
                    key={segment.label}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="14"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="butt"
                  >
                    <title>{`${segment.label}: ${pct}%`}</title>
                  </circle>
                );
              })}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            {centerValue && <span className="text-base font-semibold text-slate-900">{centerValue}</span>}
            {centerLabel && <span className="text-[11px] text-slate-500">{centerLabel}</span>}
          </div>
        )}
      </div>

      <ul className="w-full space-y-1.5 sm:w-auto">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="min-w-0 flex-1 truncate text-slate-600">{segment.label}</span>
            <span className="shrink-0 font-medium text-slate-900">
              {total > 0 ? Math.round((segment.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
