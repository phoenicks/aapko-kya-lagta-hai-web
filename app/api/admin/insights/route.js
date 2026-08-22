import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CATEGORIES } from "@/lib/categories";

const DAYS = 30;
// Soft caps on how many rows we pull to build the daily time series and
// leaderboards. The aggregation happens in JS rather than SQL so this
// route ships without another "run this in the Supabase SQL editor" step.
// Fine at the site's current scale — if any of these caps start getting
// hit routinely, move the aggregation into a Postgres function instead.
const ROW_CAP = 20000;
const MIN_VOTES_FOR_LEADERBOARD = 5;

function dateKey(iso) {
  return iso.slice(0, 10); // "YYYY-MM-DDTHH:.." -> "YYYY-MM-DD" (UTC calendar day)
}

function buildDayList(days) {
  const out = [];
  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let i = days - 1; i >= 0; i--) {
    out.push(new Date(startOfToday - i * 86400000).toISOString().slice(0, 10));
  }
  return out;
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [
    votesRes,
    postsCreatedRes,
    sessionsRes,
    commentsRes,
    allPostsRes,
    commentJoinRes,
    unsplashCountRes,
    pexelsCountRes,
  ] = await Promise.all([
    admin.from("votes").select("created_at, direction").gte("created_at", since).limit(ROW_CAP),
    admin.from("posts").select("created_at").gte("created_at", since).limit(ROW_CAP),
    admin.from("sessions").select("first_seen").gte("first_seen", since).limit(ROW_CAP),
    admin
      .from("comments")
      .select("created_at")
      .eq("status", "visible")
      .gte("created_at", since)
      .limit(ROW_CAP),
    admin
      .from("posts")
      .select("id, slug, prompt_en, category, up_count, down_count, status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("comments")
      .select("post_id, posts!inner(id, slug, prompt_en, category, status)")
      .eq("status", "visible")
      .eq("posts.status", "active")
      .limit(ROW_CAP),
    admin.from("posts").select("id", { count: "exact", head: true }).eq("image_source", "unsplash"),
    admin.from("posts").select("id", { count: "exact", head: true }).eq("image_source", "pexels"),
  ]);

  // ---- Daily time series (last 30 days) ----
  const days = buildDayList(DAYS);
  const byDay = new Map(
    days.map((d) => [d, { date: d, votesUp: 0, votesDown: 0, posts: 0, newSessions: 0, comments: 0 }])
  );

  for (const v of votesRes.data || []) {
    const row = byDay.get(dateKey(v.created_at));
    if (!row) continue;
    if (v.direction === "up") row.votesUp++;
    else row.votesDown++;
  }
  for (const p of postsCreatedRes.data || []) {
    const row = byDay.get(dateKey(p.created_at));
    if (row) row.posts++;
  }
  for (const s of sessionsRes.data || []) {
    const row = byDay.get(dateKey(s.first_seen));
    if (row) row.newSessions++;
  }
  for (const c of commentsRes.data || []) {
    const row = byDay.get(dateKey(c.created_at));
    if (row) row.comments++;
  }

  const daily = days.map((d) => byDay.get(d));

  // ---- Per-category breakdown (all-time, using posts' own up/down counters) ----
  const categoryMap = new Map(
    CATEGORIES.map((c) => [c.id, { id: c.id, label_en: c.label_en, posts: 0, votes: 0 }])
  );
  for (const p of allPostsRes.data || []) {
    const row = categoryMap.get(p.category);
    if (!row) continue;
    row.posts++;
    row.votes += (p.up_count || 0) + (p.down_count || 0);
  }

  const commentCountByPost = new Map();
  const categoryComments = new Map(CATEGORIES.map((c) => [c.id, 0]));
  for (const row of commentJoinRes.data || []) {
    const post = row.posts;
    if (!post) continue;
    commentCountByPost.set(row.post_id, (commentCountByPost.get(row.post_id) || 0) + 1);
    if (categoryComments.has(post.category)) {
      categoryComments.set(post.category, categoryComments.get(post.category) + 1);
    }
  }

  const categories = CATEGORIES.map((c) => ({
    ...categoryMap.get(c.id),
    comments: categoryComments.get(c.id) || 0,
  }));

  // ---- Leaderboards (all-time, active posts only) ----
  const activePosts = (allPostsRes.data || []).map((p) => {
    const total = (p.up_count || 0) + (p.down_count || 0);
    return {
      id: p.id,
      slug: p.slug,
      prompt_en: p.prompt_en,
      category: p.category,
      total,
      upRatio: total > 0 ? p.up_count / total : 0,
      commentCount: commentCountByPost.get(p.id) || 0,
    };
  });

  const withEnoughVotes = activePosts.filter((p) => p.total >= MIN_VOTES_FOR_LEADERBOARD);

  const mostAgreed = [...withEnoughVotes].sort((a, b) => b.upRatio - a.upRatio).slice(0, 5);
  const mostControversial = [...withEnoughVotes]
    .sort((a, b) => Math.abs(a.upRatio - 0.5) - Math.abs(b.upRatio - 0.5))
    .slice(0, 5);
  const mostCommented = activePosts
    .filter((p) => p.commentCount > 0)
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 5);

  return NextResponse.json({
    daily,
    categories,
    imageSources: [
      { source: "unsplash", count: unsplashCountRes.count || 0 },
      { source: "pexels", count: pexelsCountRes.count || 0 },
    ],
    leaderboards: { mostAgreed, mostControversial, mostCommented },
    minVotesForLeaderboard: MIN_VOTES_FOR_LEADERBOARD,
  });
}
