import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { publishDailyPosts } from "@/lib/publishDaily";

export const maxDuration = 60;

export async function POST() {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const summary = await publishDailyPosts();
  return NextResponse.json(summary);
}
