import { NextResponse } from "next/server";
import { getPostsPage } from "@/lib/posts";

// GET /api/posts?category=<id|all>&cursor=<opaque>&limit=<n>
// Powers the infinite-scroll feed on the homepage — see HomeFeed.js.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const cursor = searchParams.get("cursor") || null;

  const rawLimit = parseInt(searchParams.get("limit") || "8", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 8;

  const { posts, nextCursor, hasMore } = await getPostsPage({ category, cursor, limit });

  return NextResponse.json({ posts, nextCursor, hasMore });
}
