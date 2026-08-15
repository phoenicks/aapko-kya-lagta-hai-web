import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const postId = body?.postId;
  const direction = body?.direction;

  if (!postId || (direction !== "up" && direction !== "down")) {
    return NextResponse.json({ error: "Invalid vote payload" }, { status: 400 });
  }

  const { sessionId } = getOrCreateSessionId();
  const admin = getSupabaseAdmin();

  const { data, error } = await admin.rpc("cast_vote", {
    p_post_id: postId,
    p_session_id: sessionId,
    p_direction: direction,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    upCount: row?.up_count ?? 0,
    downCount: row?.down_count ?? 0,
  });
}
