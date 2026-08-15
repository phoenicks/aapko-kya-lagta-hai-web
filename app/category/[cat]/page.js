import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { findCategory, CATEGORIES } from "@/lib/categories";
import AppShell from "@/components/AppShell";
import DebateGrid from "@/components/DebateGrid";

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

async function getPosts(categoryId) {
  const { data } = await supabase
    .from("posts")
    .select("id, slug, category, prompt_en, prompt_hi, image_url, up_count, down_count")
    .eq("status", "active")
    .eq("category", categoryId)
    .order("created_at", { ascending: false })
    .limit(60);
  return data || [];
}

export default async function CategoryPage({ params }) {
  const category = findCategory(params.cat);
  if (!category) notFound();

  const posts = await getPosts(category.id);

  return (
    <AppShell>
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-2">
          <h1 className="text-2xl font-extrabold">{category.label_en}</h1>
          <p className="text-sm text-ink-secondary mt-1">{category.label_hi}</p>
        </div>
        <DebateGrid posts={posts} />
        {posts.length === 0 && (
          <p className="text-center text-ink-muted py-16 text-sm">
            No debates in this category yet — check back soon.
          </p>
        )}
      </main>
    </AppShell>
  );
}
