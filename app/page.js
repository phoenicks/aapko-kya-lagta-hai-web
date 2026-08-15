import AppShell from "@/components/AppShell";
import HomeFeed from "@/components/HomeFeed";
import { getPostsPage } from "@/lib/posts";

export const revalidate = 300; // refresh the server-rendered first page every 5 minutes

const FIRST_PAGE_SIZE = 8;

export default async function HomePage() {
  const { posts, nextCursor, hasMore } = await getPostsPage({
    category: "all",
    limit: FIRST_PAGE_SIZE,
  });

  return (
    <AppShell hideHeader>
      <HomeFeed initialPosts={posts} initialCursor={nextCursor} initialHasMore={hasMore} />
    </AppShell>
  );
}
