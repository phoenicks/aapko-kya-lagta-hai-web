import { supabase } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import HomeFeed from "@/components/HomeFeed";

export const revalidate = 300; // refresh the server-rendered list every 5 minutes

async function getActivePosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, category, prompt_en, prompt_hi, image_url, up_count, down_count, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("Failed to load posts:", error.message);
    return [];
  }
  return data || [];
}

export default async function HomePage() {
  const posts = await getActivePosts();

  return (
    <AppShell>
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-2 pt-1">
          <p className="text-sm text-ink-secondary">
            Red flags, cursed rooms, fit checks, AI chaos. Swipe 👍 or 👎 and see if the internet agrees with you.
          </p>
        </div>
        <HomeFeed initialPosts={posts} />
        <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center text-xs text-ink-muted">
          Aapko Kya Lagta Hai — आपको क्या लगता है? · Images sourced from Unsplash &amp; Pexels, credited on each debate page.
        </footer>
      </main>
    </AppShell>
  );
}
