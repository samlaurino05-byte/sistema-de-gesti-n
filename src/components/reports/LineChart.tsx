"use client";

import { useState } from "react";

type LineChartPoint = { label: string; value: number };

const WIDTH = 1000;
const HEIGHT = 220;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

export function LineChart({
  data,
  color = "#4f46e5",
  valueFormatter = (value: number) => String(value),
}: {
  data: LineChartPoint[];
  color?: string;
  valueFormatter?: (value: number) => string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="flex h-[220px] items-center justify-center text-sm text-slate-400">
        Sin datos para el período seleccionado.
      </p>
    );
  }

  const max = Math.max(...data.map((point) => point.value), 1);
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const slotWidth = WIDTH / data.length;

  const points = data.map((point, index) => ({
    ...point,
    index,
    x: data.length > 1 ? (index / (data.length - 1)) * WIDTH : WIDTH / 2,
    y: PADDING_TOP + usableHeight - (point.value / max) * usableHeight,
  }));

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const baseline = HEIGHT - PADDING_BOTTOM;
  const areaPath = `${linePath} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`;

  const active = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative" style={{ height: HEIGHT }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height={HEIGHT}
        preserveAspectRatio="none"
        className="overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {[0, 0.5, 1].map((step) => (
          <line
            key={step}
            x1={0}
            x2={WIDTH}
            y1={PADDING_TOP + usableHeight * step}
            y2={PADDING_TOP + usableHeight * step}
            stroke="#e2e8f0"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaPath} fill={color} fillOpacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={PADDING_TOP}
            y2={baseline}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {points.map((point) => (
          <g key={point.index}>
            <rect
              x={point.x - slotWidth / 2}
              y={0}
              width={slotWidth}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(point.index)}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
              stroke="white"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-1 text-[11px] text-slate-400">
        {points.map((point) => (
          <span key={point.index}>{point.label}</span>
        ))}
      </div>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(active.x / WIDTH) * 100}%`, top: active.y - 10 }}
        >
          <p className="font-semibold text-slate-900">{active.label}</p>
          <p className="text-slate-500">{valueFormatter(active.value)}</p>
        </div>
      )}
    </div>
  );
}
