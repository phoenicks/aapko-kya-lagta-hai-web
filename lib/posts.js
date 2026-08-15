import { supabase } from "@/lib/supabaseClient";

const POST_COLUMNS =
  "id, slug, category, prompt_en, prompt_hi, image_url, up_count, down_count, created_at";

// Keyset (a.k.a. cursor) pagination on (created_at desc, id desc) — unlike
// offset pagination, this stays correct even when new posts are inserted
// concurrently (the daily cron job), since each page is defined relative to
// the last row seen rather than a row count that can shift underneath it.
export function encodeCursor(createdAt, id) {
  return `${createdAt}_${id}`;
}

function decodeCursor(cursor) {
  const idx = cursor.lastIndexOf("_");
  if (idx === -1) return null;
  const createdAt = cursor.slice(0, idx);
  const id = cursor.slice(idx + 1);
  if (!createdAt || !id) return null;
  return { createdAt, id };
}

export async function getPostsPage({ category = "all", cursor = null, limit = 8 } = {}) {
  let query = supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    // fetch one extra row so we can tell if there's a next page without a
    // separate count query
    .limit(limit + 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      // A cursor we can't decode is a bug or tampering, not "no cursor" —
      // failing loudly here beats silently re-serving page 1, which would
      // otherwise surface as pagination silently stalling forever (new
      // "page 1" rows getting filtered out by HomeFeed's dedup-by-id).
      console.error("Malformed pagination cursor, refusing to page:", cursor);
      return { posts: [], nextCursor: null, hasMore: false };
    }
    query = query.or(
      `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load posts page:", error.message);
    return { posts: [], nextCursor: null, hasMore: false };
  }

  const rows = data || [];
  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;
  const last = posts[posts.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.created_at, last.id) : null;

  return { posts, nextCursor, hasMore };
}
