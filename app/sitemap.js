import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES } from "@/lib/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export default async function sitemap() {
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5000);

  const staticEntries = [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${siteUrl}/category/${c.id}`,
      changeFrequency: "daily",
      priority: 0.7,
    })),
  ];

  const postEntries = (posts || []).map((p) => ({
    url: `${siteUrl}/debate/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...postEntries];
}
