import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES } from "@/lib/categories";
import { getDigestGroups } from "@/lib/digest";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

// Without this, Next statically generates sitemap.xml once at build time
// and freezes it there until the next deploy — so new debates published
// daily by the cron job (which only writes to the database, no redeploy)
// never show up in it. Regenerating hourly keeps it caught up with actual
// publishing without hitting the database on every single crawl.
export const revalidate = 3600;

export default async function sitemap() {
  const [{ data: posts }, digestGroups] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5000),
    getDigestGroups(),
  ]);

  const staticEntries = [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${siteUrl}/category/${c.id}`,
      changeFrequency: "daily",
      priority: 0.7,
    })),
    { url: `${siteUrl}/submit`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/digest`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const postEntries = (posts || []).map((p) => ({
    url: `${siteUrl}/debate/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const digestEntries = digestGroups.map((g) => ({
    url: `${siteUrl}/digest/${g.category}/${g.month}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...digestEntries];
}
