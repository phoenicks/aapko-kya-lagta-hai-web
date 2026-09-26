// Shared by the debate page and the monthly digest pages so the verdict
// phrasing ("71% of 340 said yes") never drifts between the two places it
// appears. Server-safe (no client state) — this is what makes the result
// present in the raw HTML for crawlers, not just after a visitor votes.
export function computeVerdict(upCount, downCount) {
  const up = upCount || 0;
  const down = downCount || 0;
  const total = up + down;
  const pctUp = total > 0 ? Math.round((up / total) * 100) : 0;
  const pctDown = total > 0 ? 100 - pctUp : 0;
  const text =
    total === 0
      ? null
      : pctUp >= 50
      ? `${pctUp}% of ${total} said 👍 yes`
      : `${pctDown}% of ${total} said 👎 no`;
  return { total, pctUp, pctDown, text };
}
