import { NextResponse } from "next/server";
import { publishDailyPosts } from "@/lib/publishDaily";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron calls this once a day (see vercel.json). It also sends a
// `Authorization: Bearer ${CRON_SECRET}` header automatically for cron
// requests it triggers itself — we check it here so nobody else can spam
// this route and burn through your Unsplash/Pexels quota.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await publishDailyPosts();
  return NextResponse.json(summary);
}
