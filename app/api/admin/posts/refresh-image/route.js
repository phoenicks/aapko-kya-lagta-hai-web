import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { findCategory } from "@/lib/categories";
import { fetchImageForQuery, triggerUnsplashDownload } from "@/lib/images";

export const maxDuration = 30;

// Swaps just the image on an existing post (new Unsplash/Pexels pull for
// that category's query) — keeps the prompt, slug, votes, and comments
// untouched. Useful when an auto-picked photo doesn't fit the prompt well.
export async function POST(request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await admin
    .from("posts")
    .select("id, category")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: fetchError?.message || "Post not found" }, { status: 404 });
  }

  const category = findCategory(existing.category);
  if (!category) {
    return NextResponse.json({ error: `Unknown category "${existing.category}"` }, { status: 400 });
  }

  const image = await fetchImageForQuery(category.query);
  if (!image) {
    return NextResponse.json({ error: "Couldn't fetch a new image right now — try again shortly" }, { status: 502 });
  }

  const { data: updated, error: updateError } = await admin
    .from("posts")
    .update({
      image_url: image.url,
      image_source: image.source,
      image_id: image.id,
      image_credit_name: image.creditName,
      image_credit_url: image.creditUrl,
    })
    .eq("id", id)
    .select("id, image_url, image_source, image_credit_name, image_credit_url")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (image.source === "unsplash" && image.downloadLocation) {
    await triggerUnsplashDownload(image.downloadLocation);
  }

  return NextResponse.json({ post: updated });
}
