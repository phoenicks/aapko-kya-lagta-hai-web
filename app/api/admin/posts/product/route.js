import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { findCategory } from "@/lib/categories";
import { makeSlug } from "@/lib/slug";

// Manually-curated Amazon Associates product cards. This is intentionally
// admin-only and manual rather than pulling from Amazon's Product
// Advertising API — PA-API access requires 3 qualifying sales in a rolling
// 180 days before Amazon grants it, so a brand-new Associates account can't
// call it yet. Paste a product image + your Associates link here instead;
// swap to an automated PA-API pull later once the account qualifies.
export async function POST(request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const promptEn = (body?.promptEn || "").toString().trim();
  const promptHiRaw = (body?.promptHi || "").toString().trim();
  const categoryId = (body?.category || "").toString().trim();
  const imageUrl = (body?.imageUrl || "").toString().trim();
  const affiliateUrl = (body?.affiliateUrl || "").toString().trim();

  if (!promptEn || !imageUrl || !affiliateUrl) {
    return NextResponse.json(
      { error: "Prompt, image URL, and affiliate link are all required" },
      { status: 400 }
    );
  }

  const category = findCategory(categoryId);
  if (!category) return NextResponse.json({ error: "Pick a valid category" }, { status: 400 });

  if (!/^https:\/\//i.test(imageUrl)) {
    return NextResponse.json({ error: "Image URL must start with https://" }, { status: 400 });
  }
  if (!/^https:\/\/(www\.)?(amazon\.[a-z.]+|amzn\.to)\//i.test(affiliateUrl)) {
    return NextResponse.json(
      { error: "That doesn't look like an amazon.* or amzn.to Associates link" },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .insert({
      slug: makeSlug(categoryId),
      category: categoryId,
      prompt_en: promptEn,
      prompt_hi: promptHiRaw || promptEn,
      image_url: imageUrl,
      image_source: "user",
      affiliate_url: affiliateUrl,
      status: "active",
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
