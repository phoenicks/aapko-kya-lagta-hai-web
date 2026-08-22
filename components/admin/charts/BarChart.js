"use client";

// Horizontal bar list — used for the per-category breakdown. items should
// already be sorted in the order they should render.
export default function BarChart({ items, valueKey = "value", labelKey = "label", formatValue }) {
  const max = Math.max(1, ...items.map((i) => i[valueKey]));

  if (items.length === 0) {
    return <p className="text-xs text-ink-muted">No data yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item[labelKey]}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-secondary">{item[labelKey]}</span>
            <span className="text-ink-muted font-semibold">
              {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--chip-bg)" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(item[valueKey] / max) * 100}%`, background: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
