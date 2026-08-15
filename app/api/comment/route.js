import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateSessionId } from "@/lib/session";

export async function GET(request) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("post_id", postId)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comments: data });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const postId = body?.postId;
  const rawText = (body?.body || "").toString().trim();
  const rawName = (body?.authorName || "").toString().trim();

  if (!postId || !rawText) {
    return NextResponse.json({ error: "postId and body are required" }, { status: 400 });
  }
  if (rawText.length > 280) {
    return NextResponse.json({ error: "Comment too long (max 280 characters)" }, { status: 400 });
  }

  const { sessionId } = getOrCreateSessionId();
  const authorName = rawName ? rawName.slice(0, 40) : "Anonymous";

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      session_id: sessionId,
      author_name: authorName,
      body: rawText,
    })
    .select("id, author_name, body, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ comment: data });
}
