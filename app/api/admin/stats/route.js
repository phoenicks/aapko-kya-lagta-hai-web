import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [activeUsers, totalPosts, activePosts, totalVotes, totalComments] = await Promise.all([
    admin.from("sessions").select("session_id", { count: "exact", head: true }).gte("last_seen", since24h),
    admin.from("posts").select("id", { count: "exact", head: true }),
    admin.from("posts").select("id", { count: "exact", head: true }).eq("status", "active"),
    admin.from("votes").select("id", { count: "exact", head: true }),
    admin.from("comments").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    activeUsers24h: activeUsers.count || 0,
    totalPosts: totalPosts.count || 0,
    activePosts: activePosts.count || 0,
    totalVotes: totalVotes.count || 0,
    totalComments: totalComments.count || 0,
  });
}
