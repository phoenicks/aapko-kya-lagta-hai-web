import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { findCategory, CATEGORIES } from "@/lib/categories";
import { getDigestGroups, monthLabel } from "@/lib/digest";
import AppShell from "@/components/AppShell";
import DebateGrid from "@/components/DebateGrid";
import Footer from "@/components/Footer";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aapkokyalagtahai.com";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c.id }));
}

export async function generateMetadata({ params }) {
  const category = findCategory(params.cat);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.label_en} debates`,
    description: `Vote on today's ${category.label_en.toLowerCase()} debates on Aapko Kya Lagta Hai — आपको क्या लगता है?`,
    alternates: { canonical: `${siteUrl}/category/${category.id}` },
  };
}

// Fetches enough history (not just the most recent page) so the "most
// judged" rail below can surface a high-vote debate from weeks ago
// instead of it staying buried under newer, lower-vote ones — the
// resurfacing fix the AEO report asked for. Sorting by vote total isn't
// expressible in a single PostgREST `.order()` call, so it's done in JS
// after one fetch rather than a second query.
async function getPosts(categoryId) {
  const { data } = await supabase
    .from("posts")
    .select("id, slug, category, prompt_en, prompt_hi, image_url, up_count, down_count, created_at")
    .eq("status", "active")
    .eq("category", categoryId)
    .order("created_at", { ascending: false })
    .limit(500);
  return data || [];
}

const MOST_JUDGED_COUNT = 6;
const RECENT_COUNT = 60;

export default async function CategoryPage({ params }) {
  const category = findCategory(params.cat);
  if (!category) notFound();

  const [posts, digestGroups] = await Promise.all([
    getPosts(category.id),
    getDigestGroups(),
  ]);

  const mostJudged = [...posts]
    .filter((p) => (p.up_count || 0) + (p.down_count || 0) > 0)
    .sort((a, b) => (b.up_count + b.down_count) - (a.up_count + a.down_count))
    .slice(0, MOST_JUDGED_COUNT);
  const mostJudgedIds = new Set(mostJudged.map((p) => p.id));
  const recent = posts.filter((p) => !mostJudgedIds.has(p.id)).slice(0, RECENT_COUNT);

  const latestDigest = digestGroups.find((g) => g.category === category.id);

  return (
    <AppShell>
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold">{category.label_en}</h1>
          <p className="text-sm text-ink-secondary mt-1">{category.label_hi}</p>
          {latestDigest && (
            <p className="text-sm mt-3">
              <Link
                href={`/digest/${category.id}/${latestDigest.month}`}
                className="text-ink-primary underline underline-offset-2"
              >
                See the full {monthLabel(latestDigest.month)} roundup →
              </Link>
            </p>
          )}
        </div>
        <DebateGrid posts={mostJudged} heading="Most judged" />
        <DebateGrid posts={recent} heading={mostJudged.length ? "Latest" : undefined} />
        {posts.length === 0 && (
          <p className="text-center text-ink-muted py-16 text-sm">
            No debates in this category yet — check back soon.
          </p>
        )}
        <Footer />
      </main>
    </AppShell>
  );
}
