import { supabase } from "@/lib/supabaseClient";
import AppShell from "@/components/AppShell";
import HomeFeed from "@/components/HomeFeed";
import Footer from "@/components/Footer";

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
    <AppShell hideHeader>
      <main>
        <p className="sr-only">
          Red flags, cursed rooms, fit checks, AI chaos. Swipe 👍 or 👎 and see if the internet agrees with you.
        </p>
        <HomeFeed initialPosts={posts} />
        {/* Note: HomeFeed's scroll container uses overscroll-y-contain, so
            normal scrolling can't chain from the end of the feed down into
            this — it's not reachable by swipe/scroll on mobile. It's kept
            for non-JS/keyboard access; the links visitors actually reach
            while scrolling the feed live in EndOfFeedCard instead. */}
        <Footer />
      </main>
    </AppShell>
  );
}
