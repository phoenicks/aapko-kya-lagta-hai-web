import { supabase } from "./supabaseClient";
import { findCategory } from "./categories";

const POST_COLUMNS = "id, slug, category, prompt_en, prompt_hi, image_url, up_count, down_count, created_at";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-09" -> "September 2026"
export function monthLabel(month) {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function nextMonth(month) {
  const [y, m] = month.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

// Every distinct (category, calendar month) pair that has at least one
// active debate — the roundup pages only exist for combinations with real
// content, both so /digest never links to something empty and so the
// sitemap never advertises a thin/duplicate-feeling page to crawlers.
// Grouped in JS rather than a SQL GROUP BY: the dataset is small (one row
// per debate, a few hundred so far) and this avoids a second query shape
// to maintain just for what's effectively a report over data already
// cheap to pull in full.
export async function getDigestGroups() {
  const { data } = await supabase
    .from("posts")
    .select("category, created_at, up_count, down_count")
    .eq("status", "active");

  const groups = new Map();
  for (const p of data || []) {
    if (!findCategory(p.category)) continue; // skip posts under retired category ids
    const month = p.created_at.slice(0, 7); // "YYYY-MM"
    const key = `${p.category}:${month}`;
    const g = groups.get(key) || { category: p.category, month, count: 0, totalVotes: 0 };
    g.count += 1;
    g.totalVotes += (p.up_count || 0) + (p.down_count || 0);
    groups.set(key, g);
  }

  return [...groups.values()].sort(
    (a, b) => b.month.localeCompare(a.month) || a.category.localeCompare(b.category)
  );
}

// All active debates for one category within one calendar month, newest
// first — the content of a single digest page.
export async function getDigestPosts(categoryId, month) {
  const start = `${month}-01T00:00:00.000Z`;
  const end = `${nextMonth(month)}-01T00:00:00.000Z`;

  const { data } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("status", "active")
    .eq("category", categoryId)
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: false });

  return data || [];
}
