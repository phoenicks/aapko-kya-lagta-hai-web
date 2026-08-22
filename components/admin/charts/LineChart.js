"use client";

// Dependency-free multi-series line chart. Renders as an SVG so it scales
// with its container with no chart library needed — keeps the admin bundle
// small and avoids adding a new npm dependency for a handful of charts.
//
// labels: string[]               — x-axis tick labels, one per data point
// series: { name, color, values: number[] }[]  — each values[] must be the
//   same length as labels
export default function LineChart({ labels, series, height = 160 }) {
  const width = 600; // viewBox units; SVG scales to the container via CSS
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(1, ...allValues);
  const pointCount = labels.length;

  const xFor = (i) => padding.left + (innerW * i) / Math.max(1, pointCount - 1);
  const yFor = (v) => padding.top + innerH - (v / max) * innerH;

  const pointsFor = (values) => values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");

  const tickCount = Math.min(6, pointCount);
  const tickIndices = Array.from({ length: tickCount }, (_, i) =>
    Math.round((i * (pointCount - 1)) / Math.max(1, tickCount - 1))
  );

  const hasAnyValue = allValues.some((v) => v > 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + innerH * (1 - f)}
          y2={padding.top + innerH * (1 - f)}
          stroke="var(--gridline)"
          strokeWidth="1"
        />
      ))}

      {!hasAnyValue && (
        <text x={width / 2} y={padding.top + innerH / 2} fontSize="11" fill="var(--text-muted)" textAnchor="middle">
          No data yet
        </text>
      )}

      {series.map((s) => (
        <polyline
          key={s.name}
          points={pointsFor(s.values)}
          fill="none"
          stroke={s.color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {tickIndices.map((i) => (
        <text
          key={i}
          x={xFor(i)}
          y={height - 4}
          fontSize="9"
          fill="var(--text-muted)"
          textAnchor="middle"
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}
